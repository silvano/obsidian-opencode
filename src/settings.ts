import type { EnvironmentVariables } from "./utils/environment";

export interface OpencodePluginSettings {
	opencodePath: string;
	defaultWorkingDirectory: string;
	environmentVariables: EnvironmentVariables;
	terminalFontSize: number;
	terminalFontFamily: string;
	newSessionArgs: string;
	shiftEnterNewline: boolean;
	// Upstream's detection also links vault notes and wrapped TUI paths, but
	// can block Obsidian for seconds on pointer moves (see README).
	terminalLinkDetection: TerminalLinkDetection;
}

export type TerminalLinkDetection = "simple" | "upstream";

export const DEFAULT_SETTINGS: OpencodePluginSettings = {
	opencodePath: "",
	defaultWorkingDirectory: "",
	environmentVariables: {},
	terminalFontSize: 14,
	terminalFontFamily: "monospace",
	newSessionArgs: "",
	shiftEnterNewline: false,
	terminalLinkDetection: "simple",
};
