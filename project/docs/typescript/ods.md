---
title: Working with ODS in TypeScript
label: ODS
path: /typescript/ods/
order: 10
---

OpenDocument Spreadsheet (ODS) file handling with sheet selection, advanced header processing, and high-performance data operations.

## Installation

```bash
npm install fairspec
```

## Getting Started

ODS format is handled by the XLSX plugin, which provides:

- `loadXlsxTable` - Load ODS files into tables
- `saveXlsxTable` - Save tables to ODS files
- `XlsxPlugin` - Plugin for framework integration

For example:

```typescript
import { loadXlsxTable } from "fairspec"

const table = await loadXlsxTable({ data: "table.ods" })
// the column types will be automatically inferred
```

## Basic Usage

### Loading ODS Files

```typescript
import { loadXlsxTable } from "fairspec"

// Load a simple ODS file
const table = await loadXlsxTable({ data: "data.ods" })

// Load with custom format (specify sheet)
const table = await loadXlsxTable({
  data: "data.ods",
  format: {
    name: "ods",
    sheetName: "Sheet2",
  },
})

// Load multiple ODS files (concatenated)
const table = await loadXlsxTable({
  data: ["part1.ods", "part2.ods", "part3.ods"],
})
```

### Saving ODS Files

```typescript
import { saveXlsxTable } from "fairspec"

// Save with default options
await saveXlsxTable(table, {
  path: "output.ods",
  format: { name: "ods" },
})

// Save with custom sheet name
await saveXlsxTable(table, {
  path: "output.ods",
  format: {
    name: "ods",
    sheetName: "Data",
  },
})
```

## Advanced Features

### Sheet Selection

```typescript
// Select by sheet number (1-indexed)
const table = await loadXlsxTable({
  data: "workbook.ods",
  format: {
    name: "ods",
    sheetNumber: 2, // Load second sheet
  },
})

// Select by sheet name
const table = await loadXlsxTable({
  data: "workbook.ods",
  format: {
    name: "ods",
    sheetName: "Sales Data",
  },
})
```

### Multi-Header Row Processing

```typescript
// ODS with multiple header rows
const table = await loadXlsxTable({
  data: "multi-header.ods",
  format: {
    name: "ods",
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
  data: "with-comments.ods",
  format: {
    name: "ods",
    commentRows: [1, 2],
    headerRows: [3],
  },
})

// Skip rows with comment prefix
const table = await loadXlsxTable({
  data: "data.ods",
  format: {
    name: "ods",
    commentPrefix: "#",
    headerRows: [1],
  },
})
```

### Remote File Loading

```typescript
// Load from URL
const table = await loadXlsxTable({
  data: "https://example.com/data.ods",
})

// Load multiple remote files
const table = await loadXlsxTable({
  data: [
    "https://api.example.com/data-2023.ods",
    "https://api.example.com/data-2024.ods",
  ],
})
```

### Column Selection

```typescript
// Select specific columns
const table = await loadXlsxTable({
  data: "data.ods",
  format: {
    name: "ods",
    columnNames: ["name", "age", "city"],
  },
})
```
