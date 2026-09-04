---
title: Working with Tables in Terminal
label: Table
path: /terminal/table/
order: 2
---

Table operations including querying, validation, statistics, and schema management for tabular data files.

## Available Commands

The `fairspec table` command provides utilities for working with tables:

- `describe` - Get table statistics and summary information
- `query` - Query tables using SQL syntax
- `validate` - Validate table data against a Table Schema
- `infer-schema` - Automatically infer Table Schema from table data
- `render-schema` - Render Table Schema as HTML or Markdown documentation
- `validate-schema` - Validate a Table Schema file
- `infer-dialect` - Infer file dialect
- `script` - Interactive REPL session with loaded table

## Describe Tables

Get statistical summary information about a table:

```bash
# Describe a CSV file
fairspec table describe data.csv

# Describe a remote table
fairspec table describe https://example.com/data.csv

# Describe from a dataset
fairspec table describe --from-dataset dataset.json --from-resource sales

# Output as JSON
fairspec table describe data.csv --json
```

### Output

Returns statistics for each column including:

- `count` - Number of non-null values
- `null_count` - Number of null values
- `mean` - Average value (numeric columns)
- `std` - Standard deviation (numeric columns)
- `min` - Minimum value
- `max` - Maximum value
- `median` - Median value (numeric columns)

### Options

- `--from-dataset <path>` - Load table from dataset descriptor
- `--from-resource <name>` - Specify resource name from dataset
- `--debug` - Show debug information
- `--json` - Output as JSON

### Format Options

All standard format options are available (see Format Options section below).

## Query Tables

Execute SQL queries on tables using Polars SQL engine:

```bash
# Basic query
fairspec table query data.csv "SELECT * FROM self WHERE age > 25"

# Aggregate data
fairspec table query sales.csv "SELECT region, SUM(amount) as total FROM self GROUP BY region"

# Filter and sort
fairspec table query users.csv "SELECT name, email FROM self WHERE active = true ORDER BY name"

# Query from dataset resource
fairspec table query --from-dataset dataset.json --from-resource users \
  "SELECT * FROM self WHERE created_at > '2024-01-01'"
```

### SQL Syntax

- Use `self` as the table name in queries
- Supports SELECT, WHERE, GROUP BY, ORDER BY, LIMIT, JOIN, etc.
- Full Polars SQL syntax supported
- Results are output as formatted tables

### Options

- `--from-dataset <path>` - Load table from dataset descriptor
- `--from-resource <name>` - Specify resource name from dataset
- `--debug` - Show debug information
- `--json` - Output as JSON

## Validate Tables

Validate table data against a Table Schema:

```bash
# Validate with explicit schema
fairspec table validate data.csv --table-schema schema.json

# Validate with inferred schema
fairspec table validate data.csv

# Validate from dataset (uses embedded schema)
fairspec table validate --from-dataset dataset.json --from-resource users

# Output validation report as JSON
fairspec table validate data.csv --table-schema schema.json --json
```

### Validation Report

Returns a validation report with:

- `valid` - Boolean indicating if validation passed
- `errors` - Array of validation errors (if any)

Example validation errors:

```json
{
  "valid": false,
  "errors": [
    {
      "type": "table/constraint",
      "propertyName": "age",
      "rowNumber": 5,
      "message": "value 200 exceeds maximum of 150"
    },
    {
      "type": "table/type",
      "propertyName": "email",
      "rowNumber": 12,
      "message": "invalid email format"
    }
  ]
}
```

### Options

- `--table-schema <path>` - Path to Table Schema file
- `--from-dataset <path>` - Load table from dataset descriptor
- `--from-resource <name>` - Specify resource name from dataset
- `--debug` - Show debug information
- `--json` - Output as JSON

## Infer Table Schema

Automatically generate a Table Schema from table data:

```bash
# Infer schema from local file
fairspec table infer-schema data.csv

# Infer from remote file
fairspec table infer-schema https://example.com/data.csv

# Save inferred schema to file
fairspec table infer-schema data.csv --json > schema.json

# Infer with custom options
fairspec table infer-schema data.csv --sample-rows 1000 --confidence 0.95
```

### Schema Inference Options

- `--sample-rows <number>` - Number of rows to sample for inference (default: 100)
- `--confidence <number>` - Confidence threshold for type detection (0-1, default: 0.9)
- `--keep-strings` - Keep original string types instead of inferring
- `--column-types <json>` - Override types for specific columns
- `--comma-decimal` - Treat comma as decimal separator
- `--month-first` - Parse dates as month-first (MM/DD/YYYY)

### Generated Schema

The inferred schema automatically detects:

- Column types (string, integer, number, boolean, date, datetime, etc.)
- Required columns based on presence
- Enum values for columns with limited distinct values
- Numeric constraints (minimum, maximum)
- String patterns
- Missing value indicators

### Example

Given this CSV data:

```csv
id,name,price,quantity,active,created_at
1,Product A,19.99,100,true,2024-01-15
2,Product B,29.99,50,false,2024-01-20
3,Product C,39.99,75,true,2024-02-01
```

Infer the schema:

```bash
fairspec table infer-schema products.csv --json
```

Generated schema:

```json
{
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string" },
    "price": { "type": "number" },
    "quantity": { "type": "integer" },
    "active": { "type": "boolean" },
    "created_at": { "type": "date" }
  },
  "required": ["id", "name", "price", "quantity", "active", "created_at"]
}
```

## Render Table Schema

Render a Table Schema as human-readable HTML or Markdown documentation:

```bash
# Render as Markdown
fairspec table render-schema schema.json --to-format markdown

# Render as HTML
fairspec table render-schema schema.json --to-format html

# Save to file
fairspec table render-schema schema.json --to-format markdown --to-path schema.md
fairspec table render-schema schema.json --to-format html --to-path schema.html
```

### Output Formats

- `markdown` - Generates Markdown documentation with column descriptions, types, and constraints
- `html` - Generates styled HTML table documentation

### Options

- `--to-format <format>` (required) - Output format (markdown or html)
- `--to-path <path>` - Save to file instead of stdout
- `--silent` - Suppress output messages
- `--debug` - Show debug information

## Validate Table Schema

Validate that a Table Schema file is valid:

```bash
# Validate a schema file
fairspec table validate-schema schema.json

# Validate from remote source
fairspec table validate-schema https://example.com/schema.json

# Output as JSON
fairspec table validate-schema schema.json --json
```

### Schema Validation

This validates that the schema itself is:

- Valid JSON
- Compliant with Table Schema specification
- Has correct property definitions
- Uses valid column types and constraints

### Validation Report

```json
{
  "valid": true,
  "errors": []
}
```

Or if invalid:

```json
{
  "valid": false,
  "errors": [
    {
      "type": "schema/invalid",
      "message": "Invalid column type: 'txt' (did you mean 'text'?)"
    }
  ]
}
```

### Options

- `--silent` - Suppress output messages
- `--debug` - Show debug information
- `--json` - Output as JSON

## Infer File Dialect

Automatically detect the dialect of a table file:

```bash
# Infer dialect from file
fairspec table infer-dialect data.csv

# Infer from remote file
fairspec table infer-dialect https://example.com/data.xlsx

# Output as JSON
fairspec table infer-dialect data.parquet --json
```

### Detected Formats

The command can detect:

- `csv` - Comma-separated values
- `tsv` - Tab-separated values
- `json` - JSON format
- `jsonl` - JSON Lines (newline-delimited JSON)
- `xlsx` - Excel spreadsheet
- `ods` - OpenDocument Spreadsheet
- `parquet` - Apache Parquet
- `arrow` - Apache Arrow/Feather
- `sqlite` - SQLite database

### Example Output

```json
{
  "name": "csv",
  "delimiter": ",",
  "quoteChar": "\""
}
```

## Interactive Scripting

Start an interactive REPL session with a loaded table:

```bash
# Load table and start REPL
fairspec table script data.csv

# Script table from dataset
fairspec table script --from-dataset dataset.json --from-resource users
```

### Available in Session

- `fairspec` - Full fairspec library
- `table` - Loaded table (LazyDataFrame)

### Example Session

```javascript
fairspec> table
LazyDataFrame { ... }

fairspec> await table.collect()
DataFrame { ... }

fairspec> await table.select(["name", "age"]).collect()
DataFrame { ... }

fairspec> await table.filter(pl.col("age").gt(25)).collect()
DataFrame { ... }
```

## Format Options

All table commands support these format options for loading data:

### CSV/TSV Options

- `--format <name>` - Format name (csv, tsv, etc.)
- `--delimiter <char>` - Column delimiter (default: `,`)
- `--line-terminator <chars>` - Row terminator (default: `\n`)
- `--quote-char <char>` - Quote character (default: `"`)
- `--null-sequence <string>` - Null value indicator
- `--header-rows <numbers>` - Header row indices (e.g., `[1,2]`)
- `--header-join <char>` - Character to join multi-row headers
- `--comment-rows <numbers>` - Comment row indices to skip
- `--comment-prefix <char>` - Comment line prefix (e.g., `#`)
- `--column-names <names>` - Override column names (JSON array)

### JSON Options

- `--json-pointer <pointer>` - JSON pointer to data array (e.g., `/data/users`)
- `--row-type <type>` - Row format: `object` or `array`

### Excel/ODS Options

- `--sheet-number <number>` - Sheet index (0-based)
- `--sheet-name <name>` - Sheet name

### SQLite Options

- `--table-name <name>` - Table name in database

## Table Schema Options

All table commands support these schema-related options:

### Type Inference

- `--sample-rows <number>` - Sample size for type inference
- `--confidence <number>` - Confidence threshold (0-1)
- `--keep-strings` - Don't infer types, keep as strings
- `--column-types <json>` - Override types (e.g., `{"age":"integer"}`)

### Value Parsing

- `--missing-values <values>` - Missing value indicators (JSON array)
- `--decimal-char <char>` - Decimal separator (default: `.`)
- `--group-char <char>` - Thousands separator (default: `,`)
- `--comma-decimal` - Use comma as decimal (shorthand)
- `--true-values <values>` - Custom true values (JSON array)
- `--false-values <values>` - Custom false values (JSON array)

### Date/Time Parsing

- `--datetime-format <format>` - Datetime format string
- `--date-format <format>` - Date format string
- `--time-format <format>` - Time format string
- `--month-first` - Parse dates as month-first

### Array/List Parsing

- `--array-type <type>` - Array item type
- `--list-delimiter <char>` - List delimiter (default: `;`)
- `--list-item-type <type>` - List item type

## Common Workflows

### Explore Unknown Data

```bash
# 1. Infer the dialect
fairspec table infer-dialect unknown-data.txt

# 2. Get basic statistics
fairspec table describe unknown-data.txt

# 3. Infer the schema
fairspec table infer-schema unknown-data.txt --json > schema.json

# 4. Query the data
fairspec table query unknown-data.txt "SELECT * FROM self LIMIT 10"
```

### Schema-Driven Validation

```bash
# 1. Create schema from sample data
fairspec table infer-schema sample.csv --json > schema.json

# 2. Validate the schema itself
fairspec table validate-schema schema.json

# 3. Generate documentation
fairspec table render-schema schema.json --to-format markdown --to-path docs.md

# 4. Validate production data
fairspec table validate production.csv --table-schema schema.json
```

### Data Quality Checks

```bash
# Check for data quality issues
fairspec table validate data.csv --table-schema schema.json

# Get detailed statistics
fairspec table describe data.csv

# Query for specific issues
fairspec table query data.csv "SELECT * FROM self WHERE email NOT LIKE '%@%'"

# Find duplicates
fairspec table query data.csv "SELECT id, COUNT(*) as cnt FROM self GROUP BY id HAVING cnt > 1"
```

### Interactive Analysis

```bash
# Start interactive session
fairspec table script data.csv

# In REPL:
# - Explore: await table.head(10).collect()
# - Filter: await table.filter(pl.col("status").eq("active")).collect()
# - Aggregate: await table.groupBy("category").agg(pl.sum("amount")).collect()
# - Transform: await table.withColumn(pl.col("price").mul(1.1).alias("new_price")).collect()
```

### Format Conversion

```bash
# Query and output as JSON
fairspec table query data.csv "SELECT * FROM self" --json > output.json

# Get statistics and save
fairspec table describe large-file.parquet --json > stats.json
```

## Output Formats

### Text Output (default)

Human-readable output with formatted tables:

```bash
fairspec table describe data.csv
```

Output:

```
#          count  mean   std     min    max
id         100    50.5   29.01   1      100
price      100    29.99  15.43   9.99   99.99
quantity   100    75     28.87   1      150
```

### JSON Output

Machine-readable JSON for automation:

```bash
fairspec table describe data.csv --json
```

## Examples

### CSV Data Analysis

```bash
# Get overview of sales data
fairspec table describe sales.csv

# Find top customers
fairspec table query sales.csv \
  "SELECT customer, SUM(amount) as total FROM self GROUP BY customer ORDER BY total DESC LIMIT 10"

# Validate data quality
fairspec table validate sales.csv --table-schema sales-schema.json
```

### Multi-Format Pipeline

```bash
# Load Excel data
fairspec table describe report.xlsx --sheet-name "Q1 Sales"

# Query specific sheet
fairspec table query report.xlsx --sheet-name "Q1 Sales" \
  "SELECT region, SUM(revenue) FROM self GROUP BY region"

# Validate against schema
fairspec table validate report.xlsx --sheet-name "Q1 Sales" --table-schema schema.json
```

### Remote Data Validation

```bash
# Infer schema from remote data
fairspec table infer-schema https://api.example.com/export.csv --json > remote-schema.json

# Validate local data against remote schema
fairspec table validate local-data.csv --table-schema remote-schema.json
```

### Database Export Validation

```bash
# Validate SQLite export
fairspec table validate export.db --table-name users --table-schema expected-schema.json

# Get statistics from database
fairspec table describe export.db --table-name users

# Query database table
fairspec table query export.db --table-name users \
  "SELECT status, COUNT(*) FROM self GROUP BY status"
```
