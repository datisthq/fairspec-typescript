---
title: Working with CSV in TypeScript
label: CSV
path: /typescript/csv/
order: 5
---

Comprehensive CSV file handling with automatic format detection, advanced header processing, and high-performance data operations.

## Installation

```bash
npm install fairspec
```

## Getting Started

The CSV plugin provides these capabilities:

- `loadCsvTable` - Load CSV/TSV files into tables
- `saveCsvTable` - Save tables to CSV/TSV files
- `CsvPlugin` - Plugin for framework integration

For example:

```typescript
import { loadCsvTable } from "fairspec"

const table = await loadCsvTable({ data: "table.csv" })
// the column types will be automatically inferred
// or you can provide a Table Schema
```

## Basic Usage

### Loading CSV Files

```typescript
import { loadCsvTable } from "fairspec"

// Load a simple CSV file
const table = await loadCsvTable({ data: "data.csv" })

// Load with custom format
const table = await loadCsvTable({
  data: "data.csv",
  format: {
    name: "csv",
    delimiter: ";",
    headerRows: [1],
  },
})

// Load multiple CSV files (concatenated)
const table = await loadCsvTable({
  data: ["part1.csv", "part2.csv", "part3.csv"],
})
```

### Saving CSV Files

```typescript
import { saveCsvTable } from "fairspec"

// Save with default options
await saveCsvTable(table, { path: "output.csv" })

// Save with custom format
await saveCsvTable(table, {
  path: "output.csv",
  format: {
    name: "csv",
    delimiter: "\t",
    quoteChar: "'",
  },
})

// Save as TSV
await saveCsvTable(table, {
  path: "output.tsv",
  format: { name: "tsv" },
})
```

### Automatic Format Detection

```typescript
import { loadCsvTable } from "fairspec"

// Format is automatically detected when not specified
const table = await loadCsvTable({ data: "unknown-dialect.csv" })
// The CSV plugin will automatically infer delimiter, quote characters, etc.

// You can also explicitly specify the format if detection isn't accurate
const table = await loadCsvTable({
  data: "data.csv",
  format: {
    name: "csv",
    delimiter: ",",
    quoteChar: '"',
    headerRows: [1],
  },
})
```

## Advanced Features

### Multi-Header Row Processing

```typescript
// CSV with multiple header rows:
// Year,2023,2023,2024,2024
// Quarter,Q1,Q2,Q1,Q2
// Revenue,100,120,110,130

const table = await loadCsvTable({
  data: "multi-header.csv",
  format: {
    name: "csv",
    headerRows: [1, 2],
    headerJoin: "_",
  },
})
// Resulting columns: ["Year_Quarter", "2023_Q1", "2023_Q2", "2024_Q1", "2024_Q2"]
```

### Comment Row Handling

```typescript
// CSV with comment rows:
// # This is a comment
// # Generated on 2024-01-01
// Name,Age,City
// John,25,NYC

const table = await loadCsvTable({
  data: "with-comments.csv",
  format: {
    name: "csv",
    commentRows: [1, 2],
    headerRows: [3],
  },
})

// Or use commentPrefix to skip lines starting with a specific character
const table = await loadCsvTable({
  data: "with-comments.csv",
  format: {
    name: "csv",
    commentPrefix: "#",
    headerRows: [1],
  },
})
```

### Remote File Loading

```typescript
// Load from URL
const table = await loadCsvTable({
  data: "https://example.com/data.csv",
})

// Load multiple remote files
const table = await loadCsvTable({
  data: [
    "https://api.example.com/data-2023.csv",
    "https://api.example.com/data-2024.csv",
  ],
})
```
