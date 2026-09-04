# Contributing

Thank you for your interest in contributing to Fairspec TypeScript! This document provides guidelines and instructions for contributing to this project.

## Project Overview

Project is a monorepo with the following packages:

- `@fairspec/metadata`: Core metadata models and descriptors
- `@fairspec/dataset`: File, folder and stream I/O plus dataset source plugins
- `@fairspec/table`: Polars-backed table engine plus file format plugins
- `@fairspec/extension`: Table schema renderers
- `@fairspec/library`: All the above functionality behind one plugin registry
- `@fairspec/mcp-server`: MCP tools over the library actions
- `@fairspec/terminal`: Terminal interface
- `fairspec`: Meta-package that re-exports the underlying functionality

## Development Environment

### Prerequisites

- **Node**: v24.0.0 or higher
- **PNPM**: v11.0.0 or higher

### Setup

1. Clone the repository

   ```bash
   git clone https://github.com/datisthq/fairspec-typescript.git fairspec-typescript
   cd fairspec-typescript
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

## Development Workflow

### Code Style and Quality

We use vite-plus for linting and formatting, and TypeScript for type checking:

- **Lint**: Check for code issues

  ```bash
  pnpm lint
  ```

- **Format**: Auto-fix formatting issues

  ```bash
  pnpm format
  ```

- **Type Check**: Verify TypeScript types

  ```bash
  pnpm type
  ```

### Testing

Tests are collocated with the code and use Vitest through vite-plus:

- **Run All Tests**: (includes linting and building)

  ```bash
  pnpm test
  ```

- **Run Tests Only**: (without linting/building)

  ```bash
  pnpm unit
  ```

- **Run a Specific Test**:

  ```bash
  pnpm unit table/plugins/csv/actions/table/-test/load.unit.ts
  ```

  Bare `vitest` does not work here — it fails to collect suites that import
  `vite-plus/test`.

### Dependencies

Update all dependencies to their latest versions:

```bash
pnpm deps
```

## Code Style Guidelines

- Use TypeScript with strict type checking
- Follow ES modules pattern (`import`/`export`) with full `.ts` file extensions
- Unit tests are named `*.unit.ts` and live in collocated `-test` directories, alongside their `fixtures`
- Use semicolons as needed (not required everywhere)
- Use arrow function parentheses as needed (omitted for single parameters)

See `AGENTS.md` for the full set of conventions.

## Making Changes to the Meta-Package

When adding new functionality:

1. Add it to the appropriate package first
2. Ensure it's properly exported from that package's `index.ts`
3. No additional work is needed for the meta-package as it automatically re-exports everything

## Submitting Changes

1. Create a feature branch (`git checkout -b feature/your-feature`)
2. Make your changes with appropriate tests
3. Ensure the code passes all checks: `pnpm test`
4. Commit your changes with a descriptive message
5. Submit a pull request

## License

By contributing to Fairspec TypeScript, you agree that your contributions will be licensed under the project's license.

Thank you for your contribution!
