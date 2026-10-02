import { describe, expect, it, vi } from "vitest";
import { createTerminalLinkHandler, isLinkActivation, isOpenableUrl, linkHint } from "./terminalLinks";

const plain = { ctrlKey: false, metaKey: false };
const ctrl = { ctrlKey: true, metaKey: false };
const cmd = { ctrlKey: false, metaKey: true };

describe("terminal links", () => {
	it("activates links only with the platform modifier", () => {
		expect(isLinkActivation(plain, "win32")).toBe(false);
		expect(isLinkActivation(ctrl, "win32")).toBe(true);
		expect(isLinkActivation(ctrl, "linux")).toBe(true);
		expect(isLinkActivation(cmd, "linux")).toBe(false);
		expect(isLinkActivation(cmd, "darwin")).toBe(true);
		expect(isLinkActivation(ctrl, "darwin")).toBe(false);
	});

	it("opens only http and https URLs", () => {
		expect(isOpenableUrl("https://example.com/a?b=1")).toBe(true);
		expect(isOpenableUrl("http://localhost:4096")).toBe(true);
		expect(isOpenableUrl("file:///C:/Windows/System32/calc.exe")).toBe(false);
		expect(isOpenableUrl("javascript:alert(1)")).toBe(false);
		expect(isOpenableUrl("not a url")).toBe(false);
	});

	it("opens a link on modifier click and ignores plain clicks", () => {
		const open = vi.fn();
		const handler = createTerminalLinkHandler(open, "win32");

		handler(plain, "https://example.com");
		handler(ctrl, "javascript:alert(1)");
		expect(open).not.toHaveBeenCalled();

		handler(ctrl, "https://example.com");
		expect(open).toHaveBeenCalledWith("https://example.com");
	});

	it("names the platform modifier in the hover hint", () => {
		expect(linkHint("win32")).toBe("Ctrl+click to open link");
		expect(linkHint("darwin")).toBe("Cmd+click to open link");
	});
});
