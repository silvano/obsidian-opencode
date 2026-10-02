# OpenCode (silvano)

This is a fork of [Obsidian OpenCode](https://github.com/kriss-spy/obsidian-opencode) by krisspy, which embeds the OpenCode CLI in Obsidian. All credit for the plugin goes to the original work.

- Obsidian plugin page: [OpenCode](https://community.obsidian.md/plugins/opencode)
- Upstream repository: [kriss-spy/obsidian-opencode](https://github.com/kriss-spy/obsidian-opencode)

For features, usage, settings, platform support and known issues, see the [upstream README](https://github.com/kriss-spy/obsidian-opencode#readme).

## Changes in this fork

- **Separate plugin id:** Installs as `opencode-silvano` ("OpenCode (silvano)"), so it doesn't collide with the upstream plugin.
- **Line-wise mouse wheel scrolling on Windows:** One wheel notch scrolls by lines instead of a full page.
- **System color mode follows Obsidian:** OpenCode's `system` theme follows Obsidian's light/dark mode, also on Windows where ConPTY swallows the color queries.
- **Clickable terminal links:** Ctrl+click (Cmd+click on macOS) opens links in the system browser, with a hover hint.
- **Editor server restricted to localhost:** The WebSocket server that sends dropped files to OpenCode listens on `127.0.0.1` only (upstream listens on all network interfaces) and rejects browser connections, so other machines and web pages can't connect.
- **Distribution via GitHub Releases and BRAT:** Tag pushes publish releases, gated on the full test suite. The e2e tests derive the plugin id from `manifest.json`.

## Installation (via BRAT)

This fork is distributed through GitHub Releases and installed with [BRAT](https://github.com/TfTHacker/obsidian42-brat):

1. In Obsidian, install and enable **BRAT** from **Settings** → **Community plugins** → **Browse**
2. Run **BRAT: Add a beta plugin for testing** and enter `silvano/obsidian-opencode`
3. Enable **OpenCode (silvano)** in Community plugins. BRAT keeps it updated with new releases.
4. If the upstream **OpenCode** plugin is also installed, disable it so only one copy runs

## Development

Development requires Node.js 22.12 or newer. See the upstream README and [Testing in Obsidian](docs/testing-obsidian.md) for development and test commands.

### Releasing

```bash
npm version minor   # or patch
git push --follow-tags
```

The tag push runs the tests, then publishes a GitHub Release that BRAT picks up.

### Syncing this fork with upstream

```bash
git fetch upstream
git merge upstream/main
git push
```

Use *merge*, not *rebase*: rebasing overwrites the published release commits and tags of the fork. If the merge conflicts on the `version` fields in `package.json`, `manifest.json` or `versions.json`, keep the fork's values and the `opencode-silvano` id, then `git add` the files and `git commit`. The next `npm version` sets the correct version.

## License

MIT License
