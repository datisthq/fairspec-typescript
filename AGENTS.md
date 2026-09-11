# fairspec-typescript

TypeScript pnpm monorepo — a data management framework built on the Fairspec standard and
Polars DataFrames: metadata models, a table engine with per-format plugins, dataset source
plugins, a CLI and an MCP server. (Also read by Claude Code via `.claude/CLAUDE.md`.)

## Rules

- **Never commit unless asked to**
- **Never add co-authored by Claude Code to commits!**
- **Never push main or pull requests to origin unless asked to**
- **Never amend or rewrite existing commits unless asked** (`git commit --amend`, `git reset` of already-made commits, `git rebase`, force-squash) — other worktrees or sessions may be based on those commits. Fold in changes with a follow-up commit instead.
- Prioritize using LSP capabilities if possible
- When resolving a TODO, follow its instructions literally
- Run type checking, specs and linting as part of your tasks
- Start a plan from a new/updated API summary (models/signatures) and the most challenging points, then continue with your default settings
- Update docs when a change requires it

## Skills

Depth lives in `project/skills/` (reached by Claude Code through the `.claude/skills` symlink), so
this file carries invariants and the skills carry procedure. Reach for one before working in
its area:

| skill            | when                                                          |
| ---------------- | ------------------------------------------------------------- |
| `review-changes` | reviewing a pull request — also what the review workflow runs |

## Commands

- `pnpm install` — install all dependencies
- `pnpm test` — full gate: lint + build + unit
- `pnpm lint` — `vp fmt --check && vp lint` (vite-plus)
- `pnpm format` — `vp fmt`, auto-fix formatting
- `pnpm type` — `tsgo --noEmit`, recursive across packages
- `pnpm unit` — `vp test` — run from the repo root
- Single test — `pnpm unit path/to/file.unit.ts` (bare `vitest` won't load the vite-plus test runtime and fails to collect `vite-plus/test` suites)
- `pnpm build` — `tsgo` per package, emitting to `<pkg>/build`
- `pnpm leaks` / `pnpm vulns` / `pnpm scan` — gitleaks / semgrep / both
- `pnpm deps` — update all dependencies to their latest versions
- `pnpm docs:start` / `pnpm docs:build` — the livemark documentation site

## Modules

Packages form a strict DAG — `metadata` depends on nothing and everything layers up from it.
Never introduce an edge that reverses this.

```
metadata ─┬─► dataset ───┐
          ├─► extension ─┼─► library ─► mcp-server ─► terminal ─► fairspec
          └─► table ─────┘
```

- `metadata` — zod models (`Resource`, `Dataset`, `TableSchema`, `Column`, `FileDialect`), descriptor load/save, path normalization, JSON Schema profiles. No `@fairspec/*` dependencies; the base of the graph and the only browser-safe core.
- `dataset` — file, folder and stream I/O (`loadFile`, `saveFile`, `prefetchFiles`, temp files) plus dataset-source plugins: ckan, descriptor, folder, github, zenodo, zip.
- `table` — the Polars-backed table engine (normalize/denormalize, column checks and types, schema inference, the dialect sniffer) plus file-format plugins: arrow, csv, inline, json, parquet, sqlite, xlxs.
- `extension` — renderers turning a `TableSchema` into markdown or HTML.
- `library` — the plugin registry (`system.ts`) and the facade actions every consumer calls: `loadTable`, `saveTable`, `loadDataset`, `saveDataset`, `validate*`, `infer*`.
- `mcp-server` — MCP tools over the library actions, served over stdio as `fairspec mcp`.
- `terminal` — the `fairspec` CLI (commander), one command group per entity.
- `fairspec` — umbrella package re-exporting `@fairspec/library` and shipping the CLI binary.
- `project` — the documentation site in `docs/`, the agent skills in `skills/` (reached as `.claude/skills`), and the docs guard in `-test/`. Private and outside the DAG: nothing depends on it, which is why the skills live here rather than in a package something imports.

## Code structure

Organise by **concern folder, then entity**: group a file by what it _is_ (an action, a
model, a command), then subgroup by the entity it acts on.

- `actions/<entity>/<verb>.ts` — the operations everything else wraps (`actions/table/save.ts`, `actions/column/create.ts`).
- `models/<entity>.ts` — zod schemas and their derived types.
- `plugins/<name>/` — a self-contained plugin: `plugin.ts` (the class), `settings.ts`, `index.ts`, and its own `actions/` tree.
- `commands/<entity>/<verb>.ts` (terminal) — CLI commands. `tools/<entity>/<verb>.ts` (mcp-server) — MCP tools.
- `helpers/<name>.ts` — small supporting functions. `utils/<name>.ts` — heavier self-contained modules (e.g. `table/utils/sniffer/`).
- `services/`, `profiles/`, `schemas/`, `params/`, `entrypoints/` — external clients, JSON Schema profiles, bundled schemas, CLI option definitions, executable entry points.
- Root files, one concern each: `index.ts` (the public API surface), `plugin.ts`, `settings.ts`, `system.ts`, `main.ts`.

### `-test` and `-shared`

A leading `-` marks a directory that is **not a member of the structure around it**.

- **`-test/`** — unit tests and everything that exists only to serve them. `<module>.ts` is tested by `-test/<module>.unit.ts`, fixtures live in `-test/fixtures/`, and generated artifacts (snapshots, vitest-polly HAR recordings) in `-test/fixtures/generated/`. A shared test double goes in the same folder, named after its export.
- **`-shared/`** — _production_ code shared by the siblings around it that must not itself be one of them: a helper among one-action-per-file modules (`actions/column/-shared/helpers.ts`). Not fixtures, not mocks. A `-shared/` folder can hold its own `-test/`.

Test discovery is by the `*.unit.ts` **filename suffix**, not the folder name — the folder is
a structural convention. Move a test and its `fixtures/` together: `resolveSnapshotPath` and
vitest-polly both derive their paths from the test file's own directory.

## Formats

- Use 2-space indentation, UTF-8 encoding, and LF line endings
- Formatting is configured in `vite.config.ts`: no semicolons, 90-column print width, arrow parens avoided
- Use PascalCase for classes, interfaces and types; camelCase for methods and variables
- Place high-level public items first in a file and low-level private items last

## Conventions

- Package manager pnpm `^11`, Node `^24`, ES Modules throughout
- Function names are **verbNoun** — a verb plus the noun it acts on (`saveArrowTable`, `inferTableSchemaFromTable`, `createColumnFromProperty`), never a bare verb or bare noun
- Files are camelCase, named after the verb **without repeating the folder** — `actions/column/create.ts` exports `createColumnFromProperty`, not `createColumn.ts`
- One export per file is the default, not an absolute: a file may export a closely related pair (`dataset/actions/file/temp.ts` exports `getTempFilePath` and `writeTempFile`)
- Use relative imports with the full `.ts`/`.tsx` file extension
- **`index.ts` barrels are deliberate and required.** Every package publishes `"exports": "./build/index.js"`, and its `index.ts` is a curated list of explicit named re-exports — never `export *`. Adding a public API means adding its line there.
- Commit style: Conventional Commits (`feat`, `fix`, `chore`, `docs`, `refactor`); release-please derives the version and changelog from them — see **Releases**

## Types

- Use strict TypeScript with null checks, but don't add explicit return types to functions
- Never use TypeScript `any`, type casting `as`, or `!` without permission

## Specs

- Unit tests are Vitest via vite-plus, named `*.unit.ts`, in collocated `-test` folders
- Import test symbols from `vite-plus/test`, not `vitest`
- Don't add useless comments like "Arrange", "Act", "Assert"
- **The suite must pass on Windows — CI runs it there via `pnpm test:win`.** Never assert on a raw path string: `readlink`, `join` and `import.meta.dirname` all speak the platform separator, so `expect(target).toBe("../AGENTS.md")` passes locally and fails on Windows with a backslashed target. Compare paths only after `resolve()`-ing both sides, and match file content against `\r?\n`, never a bare newline literal.
- Network tests use `useRecording()` from `vitest-polly`; the HAR lands in `-test/fixtures/generated/<test-name>_<hash>/`. Renaming a `describe`/`it` renames that directory, so the old recording is orphaned and the next run silently re-records from the live network — check `git status` after renaming a recorded test.

## Releases

Conventional Commits drive [release-please](https://github.com/googleapis/release-please): a
`feat` or `fix` landing on `main` opens a Release PR, and merging that PR cuts the version,
tags it and publishes. Merging is the gate — nothing ships without it.

- **IMPORTANT: only changes to the published packages use `feat` or `fix`.** Everything else MUST be
  `chore` or `docs` — CI and workflows, release config, dependencies, tooling, `AGENTS.md`,
  the README, the docs site
- This is not a style preference. release-please reads the commit type: a `fix:` on a workflow
  file cuts a release and burns a version number on a change no consumer can observe. Version
  numbers can never be reused
- When in doubt, ask whether the change alters what someone installing a package gets.
  If it does not, it is `chore`
- Release config lives in `.release/config.json` and `.release/manifest.json`. The manifest
  holds the current version and release-please maintains it — never hand-edit it

## Docs

- Add Typedoc comments only for public APIs; don't add them for files or use `@params` directives
- Add brief docstrings for exported functions and models (explain what it does)
- **Comments must not outnumber code.** If a file has more comment lines than code lines, the comments get cut, not the code. A single comment is at most ~3 lines. The bar is not "true" or "useful context" — it is: **name the specific mistake this comment prevents**. If you cannot name one in a sentence, delete it. Most code needs no comment at all: a file with zero is the normal case, not a gap to fill.
- **Design rationale is git history, not file content.** `git log`/`git blame` already hold why a thing was chosen and what it replaced. A file carries only what someone editing THAT line needs in order not to break something — a non-obvious invariant, a failure that presents as success, a deliberate deviation from a rule in this file.
- Never worth a line: restating what the next statement plainly does · explaining what a well-named function already names · narrating rejected alternatives · defending a choice nobody would question · a preamble on every entry in a config object
