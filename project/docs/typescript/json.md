---
title: Working with JSON tables in TypeScript
label: JSON
path: /typescript/json/
order: 7
---

JSON file handling with automatic format detection and high-performance data operations.

## Installation

```bash
npm install fairspec
```

## Getting Started

The JSON plugin provides:

- `loadJsonTable` - Load JSON files into tables
- `saveJsonTable` - Save tables to JSON files
- `JsonPlugin` - Plugin for framework integration

For example:

```typescript
import { loadJsonTable } from "fairspec"

const table = await loadJsonTable({ data: "table.json" })
// Standard JSON array of objects format
```

## Basic Usage

### Loading JSON Files

```typescript
import { loadJsonTable } from "fairspec"

// Load from local file
const table = await loadJsonTable({ data: "data.json" })

// Load from remote URL
const table = await loadJsonTable({
  data: "https://example.com/data.json",
})

// Load multiple files (concatenated)
const table = await loadJsonTable({
  data: ["file1.json", "file2.json"],
})
```

### Saving JSON Files

```typescript
import { saveJsonTable } from "fairspec"

// Save with default options
await saveJsonTable(table, { path: "output.json" })

// Save with explicit format
await saveJsonTable(table, {
  path: "output.json",
  format: { name: "json" },
})
```

## Standard Format

JSON tables use an array of objects format:

```json
[
  { "id": 1, "name": "Alice", "age": 30 },
  { "id": 2, "name": "Bob", "age": 25 }
]
```

## Advanced Features

### JSON Pointer Extraction

Extract data from nested objects using `jsonPointer`:

```typescript
// Input: {"users": [{"id": 1, "name": "Alice"}]}
const table = await loadJsonTable({
  data: "data.json",
  format: {
    name: "json",
    jsonPointer: "users",
  },
})
```

### Column Selection

Select specific columns using `columnNames`:

```typescript
// Only load specific columns
const table = await loadJsonTable({
  data: "data.json",
  format: {
    name: "json",
    columnNames: ["name", "age"],
  },
})
```

### Array Format Handling

Handle CSV-style array data with `rowType: "array"`:

```typescript
// Input: [["id", "name"], [1, "Alice"], [2, "Bob"]]
const table = await loadJsonTable({
  data: "data.json",
  format: {
    name: "json",
    rowType: "array",
  },
})
```

### Saving with JSON Pointer

Wrap data in a nested structure when saving:

```typescript
// Output: {"users": [{"id": 1, "name": "Alice"}]}
await saveJsonTable(table, {
  path: "output.json",
  format: {
    name: "json",
    jsonPointer: "users",
  },
})
```
