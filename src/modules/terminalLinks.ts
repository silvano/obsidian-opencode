interface LinkClick {
	ctrlKey: boolean;
	metaKey: boolean;
}

// Like VS Code, only a modifier click opens a link; a plain click stays a normal
// terminal click so OpenCode still receives it.
export function isLinkActivation(event: LinkClick, platform: NodeJS.Platform): boolean {
	return platform === "darwin" ? event.metaKey : event.ctrlKey;
}

export function isOpenableUrl(uri: string): boolean {
	try {
		const { protocol } = new URL(uri);
		return protocol === "http:" || protocol === "https:";
	} catch {
		return false;
	}
}

export function linkHint(platform: NodeJS.Platform): string {
	return `${platform === "darwin" ? "Cmd" : "Ctrl"}+click to open link`;
}

export function createTerminalLinkHandler(
	open: (uri: string) => void,
	platform: NodeJS.Platform,
): (event: LinkClick, uri: string) => void {
	return (event, uri) => {
		if (isLinkActivation(event, platform) && isOpenableUrl(uri)) open(uri);
	};
}
