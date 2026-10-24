interface TerminalBufferLine {
	translateToString(trimRight?: boolean, startColumn?: number, endColumn?: number): string;
}

interface TerminalBuffer {
	length: number;
	viewportY: number;
	getLine(index: number): TerminalBufferLine | undefined;
}

const PREVIEW_INPUT_DEBOUNCE_MS = 50;
const NAVIGATION_KEYS = ["\x1b[A", "\x1b[B", "\x1bOA", "\x1bOB", "\x10", "\x0e"];
function isThemeNavigation(data: string): boolean {
	if (!data) return false;
	while (data) {
		const key = NAVIGATION_KEYS.find(key => data.startsWith(key));
		if (!key) return false;
		data = data.slice(key.length);
	}
	return true;
}
function isColorResponse(data: string): boolean {
	return data.startsWith("\x1b]") && data.endsWith("\x1b\\") &&
		/^(?:10|11);rgb:[\da-f]{4}\/[\da-f]{4}\/[\da-f]{4}$/i.test(data.slice(2, -2));
}

// OpenCode previews on every navigation event. OpenTUI drains every key from a
// stdin chunk synchronously but schedules only one render for that chunk, so a
// short burst in one PTY write paints only the final theme state.
export class ThemePreviewInputBatcher {
	private pending = "";
	private flushTimer: number | null = null;

	constructor(private write: (data: string) => void, private window: Window) {}

	send(data: string, themePickerOpen: boolean): void {
		if (isColorResponse(data)) {
			this.write(data);
			return;
		}
		if (themePickerOpen && data === "\x1b") {
			this.cancelPending();
			this.write(data);
			return;
		}
		if (!themePickerOpen || !isThemeNavigation(data)) {
			this.flushWith(data);
			return;
		}
		this.pending += data;
		if (this.flushTimer !== null) this.window.clearTimeout(this.flushTimer);
		this.flushTimer = this.window.setTimeout(() => this.flushWith(""), PREVIEW_INPUT_DEBOUNCE_MS);
	}

	dispose(): void {
		this.cancelPending();
	}

	private flushWith(data: string): void {
		if (this.flushTimer !== null) this.window.clearTimeout(this.flushTimer);
		this.flushTimer = null;
		const output = this.pending + data;
		this.pending = "";
		if (output) this.write(output);
	}

	private cancelPending(): void {
		if (this.flushTimer !== null) this.window.clearTimeout(this.flushTimer);
		this.flushTimer = null;
		this.pending = "";
	}
}

export function isOpenCodeThemePicker(buffer: TerminalBuffer, visibleRows: number): boolean {
	const end = Math.min(buffer.length, buffer.viewportY + visibleRows);
	for (let index = buffer.viewportY; index < end; index++) {
		const line = buffer.getLine(index)?.translateToString(true).trim() ?? "";
		if (line.startsWith("Themes") && line.endsWith("esc")) return true;
	}
	return false;
}

function oscChannels(color: string): [number, number, number] | null {
	const value = color.trim();
	const shortHex = /^#([\da-f])([\da-f])([\da-f])$/i.exec(value);
	if (shortHex) return shortHex.slice(1).map((channel) => Number.parseInt(channel.repeat(2), 16)) as [number, number, number];
	const hex = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(value);
	if (hex) return hex.slice(1).map((channel) => Number.parseInt(channel, 16)) as [number, number, number];
	const rgb = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,[^)]*)?\)$/i.exec(value);
	if (!rgb) return null;
	const channels = rgb.slice(1, 4).map(Number) as [number, number, number];
	return channels.every((channel) => channel >= 0 && channel <= 255) ? channels : null;
}

// DEC mode 2031 theme-change report. OpenTUI only uses it as a trigger to
// re-query OSC 10/11, so the payload just has to be well-formed.
export function themeModeReport(dark: boolean): string {
	return dark ? "\x1b[?997;1n" : "\x1b[?997;2n";
}

// OpenTUI accepts the OSC replies for only 250 ms after a mode 2031 report.
// ConPTY can deliver them later while the machine is busy (cold boot), and
// OpenCode then stays on its dark fallback, so the report is repeated.
export const HOST_THEME_REPORT_DELAYS = [0, 300, 1000, 3000, 8000] as const;

export class HostThemeReporter {
	private timers: number[] = [];

	constructor(private readonly report: () => void, private readonly host: Window) {}

	schedule(): void {
		this.cancel();
		this.timers = HOST_THEME_REPORT_DELAYS.map((delay) => this.host.setTimeout(() => this.report(), delay));
	}

	dispose(): void {
		this.cancel();
	}

	private cancel(): void {
		for (const timer of this.timers) this.host.clearTimeout(timer);
		this.timers = [];
	}
}

// ConPTY drops OSC sequences written as plain VT input. Sent as win32-input-mode
// key events, each character reaches the child unparsed.
export function win32InputSequence(text: string): string {
	return [...text].map((char) => `\x1b[0;0;${char.charCodeAt(0)};1;0;1_`).join("");
}

export function terminalColorQueryResponse(osc: 10 | 11, color: string): string | null {
	const channels = oscChannels(color);
	if (!channels) return null;
	const encoded = channels.map((channel) => channel.toString(16).padStart(2, "0").repeat(2));
	return `\x1b]${osc};rgb:${encoded.join("/")}\x1b\\`;
}
