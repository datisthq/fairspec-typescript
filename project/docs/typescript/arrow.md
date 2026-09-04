---
title: Working with Arrow in TypeScript
label: Arrow
path: /typescript/arrow/
order: 11
---

Apache Arrow IPC file handling with high-performance columnar data processing.

## Installation

```bash
npm install fairspec
```

## Getting Started

The Arrow plugin provides:

- `loadArrowTable` - Load Arrow IPC files into tables
- `saveArrowTable` - Save tables to Arrow IPC files
- `ArrowPlugin` - Plugin for framework integration

For example:

```typescript
import { loadArrowTable } from "fairspec"

const table = await loadArrowTable({ data: "table.arrow" })
// High-performance columnar format
```

## Basic Usage

### Loading Arrow Files

```typescript
import { loadArrowTable } from "fairspec"

// Load from local file
const table = await loadArrowTable({ data: "data.arrow" })

// Load from remote URL
const table = await loadArrowTable({
  data: "https://example.com/data.arrow",
})

// Load multiple files (concatenated)
const table = await loadArrowTable({
  data: ["file1.arrow", "file2.arrow"],
})
```

### Saving Arrow Files

```typescript
import { saveArrowTable } from "fairspec"

// Save with default options
await saveArrowTable(table, { path: "output.arrow" })

// Save with explicit format
await saveArrowTable(table, {
  path: "output.arrow",
  format: { name: "arrow" },
})
```

## Advanced Features

### Remote File Loading

```typescript
// Load from URL
const table = await loadArrowTable({
  data: "https://example.com/data.arrow",
})

// Load multiple remote files
const table = await loadArrowTable({
  data: [
    "https://api.example.com/data-2023.arrow",
    "https://api.example.com/data-2024.arrow",
  ],
})
```
