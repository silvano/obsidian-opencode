import { expect, it } from "vitest";
import type { Terminal } from "@xterm/xterm";
import { TerminalLinks } from "./terminalLinks";

// After a ConPTY resize, xterm can mark every row of OpenCode's home screen as
// wrapped, so the whole screen is one logical line.
function wrappedScreen(rows: number, cols: number): Terminal {
	// Generic OpenCode home layout: logo, prompt box and footer, the rest blank.
	const layout: Record<number, string> = {
		35: " ".repeat(68) + "▄",
		36: " ".repeat(35) + "█▀▀█ █▀▀█ █▀▀█ █▀▀▄ █▀▀▀ █▀▀█ █▀▀█ █▀▀█",
		37: " ".repeat(35) + "█  █ █  █ █▀▀▀ █  █ █    █  █ █  █ █▀▀▀",
		38: " ".repeat(35) + "▀▀▀▀ █▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀",
		41: " ".repeat(17) + "┃",
		42: " ".repeat(17) + "┃  Ask anything… \"Fix a TODO in the codebase\"",
		43: " ".repeat(17) + "┃",
		44: " ".repeat(17) + "┃",
		45: " ".repeat(17) + "╹" + "▀".repeat(73),
		46: " ".repeat(17) + "~/vault:main  shift+tab agents  ctrl+p commands",
		79: " ".repeat(102) + "2.1.4",
	};
	const text = (row: number) => layout[row] ?? "";
	return {
		buffer: { active: { length: rows, viewportY: 0, getLine: (row: number) => row < 0 || row >= rows ? undefined : {
			length: cols, isWrapped: row > 0, getCell: (col: number) => ({ getChars: () => text(row)[col] ?? " ", getWidth: () => 1 }),
		} } },
		cols, rows, hasSelection: () => false,
		modes: { mouseTrackingMode: "any" }, options: {},
	} as unknown as Terminal;
}

// Upstream bug: one pointer-move lookup on such a screen takes ~2 s and blocks
// Obsidian (https://github.com/kriss-spy/obsidian-opencode/issues/70). Fails until upstream fixes it; run with OBSIDIAN_OPENCODE_LINK_PERF=1.
// The fork defaults to simple links (README).
it.runIf(process.env.OBSIDIAN_OPENCODE_LINK_PERF)("looks up links on a fully wrapped OpenCode screen within one frame budget", () => {
	const links = new TerminalLinks(wrappedScreen(81, 109), {
		vaultRoot: "/vault", hasNote: () => false,
		openNote: async () => {}, openExternal: async () => {}, isModEvent: () => false, onError: () => {},
	});
	const start = performance.now();
	links.provideLinks(37, () => {});
	expect(performance.now() - start).toBeLessThan(100);
});
