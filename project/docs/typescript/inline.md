---
title: Working with Inline Data tables in TypeScript
label: Inline Data
path: /typescript/inline/
order: 14
---

Inline data handling for tables embedded directly in resource definitions.

## Installation

```bash
npm install fairspec
```

## Getting Started

The Inline plugin provides:

- `loadInlineTable` - Load tables from inline data
- `InlinePlugin` - Plugin for framework integration

For example:

```typescript
import { loadInlineTable } from "fairspec"

const table = await loadInlineTable({
  data: [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ],
})
```

## Basic Usage

### Object Format Data

The most common format is an array of objects:

```typescript
import { loadInlineTable } from "fairspec"

const table = await loadInlineTable({
  data: [
    { id: 1, name: "english", native: "English" },
    { id: 2, name: "chinese", native: "中文" },
    { id: 3, name: "spanish", native: "Español" },
  ],
})
```

### Array Format Data

You can also use array-of-arrays format with the first row as headers:

```typescript
import { loadInlineTable } from "fairspec"

const table = await loadInlineTable({
  data: [
    ["id", "name", "native"],
    [1, "english", "English"],
    [2, "chinese", "中文"],
    [3, "spanish", "Español"],
  ],
})
```

## Advanced Features

### With Table Schema

Provide a Table Schema for type validation and conversion:

```typescript
import { loadInlineTable } from "fairspec"

const table = await loadInlineTable({
  data: [
    { id: 1, name: "english", active: true },
    { id: 2, name: "chinese", active: false },
  ],
  tableSchema: {
    properties: {
      id: { type: "integer" },
      name: { type: "string" },
      active: { type: "boolean" },
    },
  },
})
```

### Mixed with File Data

Inline data can be used alongside file-based resources in datasets:

```typescript
import { loadInlineTable, loadCsvTable } from "fairspec"

// Load inline reference data
const languages = await loadInlineTable({
  name: "languages",
  data: [
    { id: 1, name: "english" },
    { id: 2, name: "chinese" },
  ],
})

// Load main data from file
const users = await loadCsvTable({
  name: "users",
  data: "users.csv",
})
```

### Resource Metadata

You can include metadata with inline data resources:

```typescript
import { loadInlineTable } from "fairspec"

const table = await loadInlineTable({
  name: "countries",
  title: "Country Reference Data",
  description: "ISO country codes and names",
  data: [
    { code: "US", name: "United States" },
    { code: "CN", name: "China" },
    { code: "ES", name: "Spain" },
  ],
  tableSchema: {
    properties: {
      code: { type: "string" },
      name: { type: "string" },
    },
  },
})
```
