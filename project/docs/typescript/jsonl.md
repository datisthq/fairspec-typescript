---
title: Working with JSONL tables in TypeScript
label: JSONL
path: /typescript/jsonl/
order: 8
---

JSONL (JSON Lines) file handling with automatic format detection and high-performance data operations.

## Installation

```bash
npm install fairspec
```

## Getting Started

The JSONL format is handled by the JSON plugin, which provides:

- `loadJsonTable` - Load JSONL files into tables
- `saveJsonTable` - Save tables to JSONL files
- `JsonPlugin` - Plugin for framework integration

For example:

```typescript
import { loadJsonTable } from "fairspec"

const table = await loadJsonTable({ data: "table.jsonl" })
// Newline-delimited JSON objects
```

## Basic Usage

### Loading JSONL Files

```typescript
import { loadJsonTable } from "fairspec"

// Load from local file
const table = await loadJsonTable({ data: "data.jsonl" })

// Load with explicit format
const table = await loadJsonTable({
  data: "data.jsonl",
  format: { name: "jsonl" },
})

// Load multiple files (concatenated)
const table = await loadJsonTable({
  data: ["part1.jsonl", "part2.jsonl"],
})
```

### Saving JSONL Files

```typescript
import { saveJsonTable } from "fairspec"

// Save as JSONL
await saveJsonTable(table, {
  path: "output.jsonl",
  format: { name: "jsonl" },
})
```

## Standard Format

JSONL uses newline-delimited JSON objects:

```jsonl
{"id": 1, "name": "Alice", "age": 30}
{"id": 2, "name": "Bob", "age": 25}
{"id": 3, "name": "Charlie", "age": 35}
```

## Advanced Features

### Column Selection

Select specific columns using `columnNames`:

```typescript
// Only load specific columns
const table = await loadJsonTable({
  data: "data.jsonl",
  format: {
    name: "jsonl",
    columnNames: ["name", "age"],
  },
})
```

### Array Format Handling

Handle CSV-style array data with `rowType: "array"`:

```typescript
// Input JSONL with arrays:
// ["id", "name"]
// [1, "Alice"]
// [2, "Bob"]

const table = await loadJsonTable({
  data: "data.jsonl",
  format: {
    name: "jsonl",
    rowType: "array",
  },
})
```

### Remote File Loading

```typescript
// Load from URL
const table = await loadJsonTable({
  data: "https://example.com/data.jsonl",
})

// Load multiple remote files
const table = await loadJsonTable({
  data: [
    "https://api.example.com/logs-2023.jsonl",
    "https://api.example.com/logs-2024.jsonl",
  ],
})
```
