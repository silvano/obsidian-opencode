## Repo facts

- Fork of `kriss-spy/obsidian-opencode`. Plugin id is `opencode-silvano` (`manifest.json`). Never change it back to `opencode`, and never hardcode the id; code and e2e specs derive it from the manifest.
- Every user-visible change in this fork must be added to the "Changes in this fork" list in `README.md`, in the same commit. Don't copy upstream documentation into the README; link to it.
- Sync upstream with `git merge upstream/main`. Never rebase, because that rewrites published release commits and tags. On version conflicts in `package.json`/`manifest.json`/`versions.json`, keep the fork's values.
- Single esbuild bundle: `src/main.ts` -> `main.js` (CJS, Node builtins/`obsidian`/`electron` external). `main.js` is **tracked in git** and is committed with source changes, so rebuild before committing.
- Read `CONTEXT.md` (domain vocabulary) and `docs/adr/` before changing an area. Before touching keyboard, IME, paste or drop handling, read `docs/terminal-input.md` and ADR 0001: xterm `onData` must stay the only writer to `PtySession.writeStdin`.

## Commands

- `npm test` runs Vitest unit tests (`src/**/*.test.ts`). `obsidian` is aliased to `__mocks__/obsidian.ts`; extend that mock when you use new Obsidian APIs. Run a single file with `npx vitest run src/modules/ptySession.test.ts`.
- `npm run build` is the typecheck (`tsc --noEmit`, TypeScript 4.7.4 pinned) plus a production bundle. No linter or formatter is configured.
- `npm run test:obsidian` builds the plugin, then runs WebdriverIO e2e (`test/specs/*.e2e.ts`) in a fresh, isolated Obsidian instance. It downloads Obsidian into `.obsidian-cache/` and writes screenshots to `test-results/obsidian/`. CI pins `OBSIDIAN_VERSION=1.12.7 OBSIDIAN_INSTALLER_VERSION=1.12.7`. Filter tests with `OBSIDIAN_TEST_GREP` (e.g. `npm run test:obsidian:smoke`).
- The e2e suite uses fake `opencode` executables from `test/fixtures/`. `test:obsidian:windows-ui` uses the real local `opencode` CLI and config and is not part of CI.
- CI (`.github/workflows/test.yml`) runs `npm test` and `npm run test:obsidian` on both Ubuntu (Xvfb) and Windows.
- `.\deploy.ps1 -Vault <vault path>` builds the plugin and copies `main.js`/`manifest.json`/`styles.css` into `<vault>/.obsidian/plugins/opencode-silvano`.

## Generated files (do not hand-edit)

- `src/pty/windowsPtyNativeX64.ts` / `windowsPtyNativeArm64.ts` contain zigpty `.node` prebuilds encoded as base64. Regenerate them with `npm run embed:windows-pty` after a zigpty upgrade.
- `src/pty/windowsPtyJobHost.ts` contains `native/windows-pty-job-host.cs` encoded as base64. Regenerate it with `npm run embed:windows-job-host` after editing the C# file. This only works on Windows because it uses .NET Framework `csc.exe`.
- These files are huge, so don't read them in full.

## Release

- `npm version <x.y.z>` bumps `manifest.json` and `versions.json` (via `version-bump.mjs`). `.npmrc` sets no `v` tag prefix.
- Pushing a tag triggers `release.yml`: the test workflow runs, then CI checks that the tag equals `manifest.json` version and publishes a GitHub Release with `main.js`, `manifest.json` and `styles.css` (installed via BRAT). A tag containing `-` creates a prerelease.

## Issue tracking

- GitHub issues via `gh`; see `docs/agents/issue-tracker.md`. Triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix` (`docs/agents/triage-labels.md`).
