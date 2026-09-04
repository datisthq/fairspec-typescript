---
title: Working with TSV in TypeScript
label: TSV
path: /typescript/tsv/
order: 6
---

Tab-separated values (TSV) file handling with automatic format detection and high-performance data operations.

## Installation

```bash
npm install fairspec
```

## Getting Started

The TSV format is handled by the CSV plugin, which provides:

- `loadCsvTable` - Load TSV files into tables
- `saveCsvTable` - Save tables to TSV files
- `CsvPlugin` - Plugin for framework integration

For example:

```typescript
import { loadCsvTable } from "fairspec"

const table = await loadCsvTable({ data: "table.tsv" })
// the column types will be automatically inferred
```

## Basic Usage

### Loading TSV Files

```typescript
import { loadCsvTable } from "fairspec"

// Load a simple TSV file
const table = await loadCsvTable({ data: "data.tsv" })

// Load with explicit format
const table = await loadCsvTable({
  data: "data.tsv",
  format: {
    name: "tsv",
    headerRows: [1],
  },
})

// Load multiple TSV files (concatenated)
const table = await loadCsvTable({
  data: ["part1.tsv", "part2.tsv", "part3.tsv"],
})
```

### Saving TSV Files

```typescript
import { saveCsvTable } from "fairspec"

// Save with default options
await saveCsvTable(table, {
  path: "output.tsv",
  format: { name: "tsv" },
})

// Save with line terminator option
await saveCsvTable(table, {
  path: "output.tsv",
  format: {
    name: "tsv",
    lineTerminator: "\r\n",
  },
})
```

## Advanced Features

### Multi-Header Row Processing

```typescript
// TSV with multiple header rows
const table = await loadCsvTable({
  data: "multi-header.tsv",
  format: {
    name: "tsv",
    headerRows: [1, 2],
    headerJoin: "_",
  },
})
```

### Comment Handling

```typescript
// TSV with comment lines
const table = await loadCsvTable({
  data: "with-comments.tsv",
  format: {
    name: "tsv",
    commentPrefix: "#",
    headerRows: [1],
  },
})

// Or specify specific comment row numbers
const table = await loadCsvTable({
  data: "with-comments.tsv",
  format: {
    name: "tsv",
    commentRows: [1, 2],
    headerRows: [3],
  },
})
```

### Remote File Loading

```typescript
// Load from URL
const table = await loadCsvTable({
  data: "https://example.com/data.tsv",
})

// Load multiple remote files
const table = await loadCsvTable({
  data: [
    "https://api.example.com/data-2023.tsv",
    "https://api.example.com/data-2024.tsv",
  ],
})
```
