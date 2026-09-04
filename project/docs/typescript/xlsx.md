---
title: Working with XLSX in TypeScript
label: XLSX
path: /typescript/xlsx/
order: 9
---

Excel (.xlsx) file handling with sheet selection, advanced header processing, and high-performance data operations.

## Installation

```bash
npm install fairspec
```

## Getting Started

The XLSX plugin provides:

- `loadXlsxTable` - Load Excel files into tables
- `saveXlsxTable` - Save tables to Excel files
- `XlsxPlugin` - Plugin for framework integration

For example:

```typescript
import { loadXlsxTable } from "fairspec"

const table = await loadXlsxTable({ data: "table.xlsx" })
// the column types will be automatically inferred
```

## Basic Usage

### Loading XLSX Files

```typescript
import { loadXlsxTable } from "fairspec"

// Load a simple XLSX file
const table = await loadXlsxTable({ data: "data.xlsx" })

// Load with custom format (specify sheet)
const table = await loadXlsxTable({
  data: "data.xlsx",
  format: {
    name: "xlsx",
    sheetName: "Sheet2",
  },
})

// Load multiple XLSX files (concatenated)
const table = await loadXlsxTable({
  data: ["part1.xlsx", "part2.xlsx", "part3.xlsx"],
})
```

### Saving XLSX Files

```typescript
import { saveXlsxTable } from "fairspec"

// Save with default options
await saveXlsxTable(table, { path: "output.xlsx" })

// Save with custom sheet name
await saveXlsxTable(table, {
  path: "output.xlsx",
  format: {
    name: "xlsx",
    sheetName: "Data",
  },
})
```

## Advanced Features

### Sheet Selection

```typescript
// Select by sheet number (1-indexed)
const table = await loadXlsxTable({
  data: "workbook.xlsx",
  format: {
    name: "xlsx",
    sheetNumber: 2, // Load second sheet
  },
})

// Select by sheet name
const table = await loadXlsxTable({
  data: "workbook.xlsx",
  format: {
    name: "xlsx",
    sheetName: "Sales Data",
  },
})
```

### Multi-Header Row Processing

```typescript
// XLSX with multiple header rows
const table = await loadXlsxTable({
  data: "multi-header.xlsx",
  format: {
    name: "xlsx",
    headerRows: [1, 2],
    headerJoin: "_",
  },
})
// Resulting columns: ["Year_Quarter", "2023_Q1", "2023_Q2", "2024_Q1", "2024_Q2"]
```

### Comment Row Handling

```typescript
// Skip specific comment rows
const table = await loadXlsxTable({
  data: "with-comments.xlsx",
  format: {
    name: "xlsx",
    commentRows: [1, 2],
    headerRows: [3],
  },
})

// Skip rows with comment prefix
const table = await loadXlsxTable({
  data: "data.xlsx",
  format: {
    name: "xlsx",
    commentPrefix: "#",
    headerRows: [1],
  },
})
```

### Remote File Loading

```typescript
// Load from URL
const table = await loadXlsxTable({
  data: "https://example.com/data.xlsx",
})

// Load multiple remote files
const table = await loadXlsxTable({
  data: [
    "https://api.example.com/data-2023.xlsx",
    "https://api.example.com/data-2024.xlsx",
  ],
})
```

### Column Selection

```typescript
// Select specific columns
const table = await loadXlsxTable({
  data: "data.xlsx",
  format: {
    name: "xlsx",
    columnNames: ["name", "age", "city"],
  },
})
```
