---
title: Working with Datasets in Terminal
label: Dataset
path: /terminal/dataset/
order: 1
---

Dataset operations for managing collections of tabular resources with metadata and schemas.

## Available Commands

The `fairspec dataset` command provides utilities for working with datasets:

- `infer` - Automatically infer a dataset descriptor from data files
- `copy` - Copy datasets to a local folder
- `validate` - Validate dataset descriptors and their resources
- `list` - List resources in a dataset
- `script` - Interactive REPL session with loaded dataset

## What is a Dataset?

A dataset is a collection of related data resources (tables) with:

- Metadata describing the dataset (title, description, license, etc.)
- Resource definitions for each table (path, format, schema)
- Table Schemas defining the structure of each resource
- Relationships and foreign keys between resources

Datasets use JSON descriptor files (often named `dataset.json`) following the Fairspec specification.

## Infer Dataset

Automatically generate a dataset descriptor from data files:

```bash
# Infer from single file
fairspec dataset infer data.csv

# Infer from multiple files
fairspec dataset infer users.csv products.csv orders.csv

# Infer with remote files
fairspec dataset infer https://example.com/data1.csv data2.csv

# Save to descriptor file
fairspec dataset infer *.csv --json > dataset.json
```

### Inference Process

The infer command automatically:

1. Detects format for each file (CSV, JSON, Excel, etc.)
2. Infers Table Schema for each resource
3. Generates resource names from file names
4. Creates a complete dataset descriptor

### Options

- `--debug` - Show debug information
- `--json` - Output as JSON

### Format Options

Format detection and schema inference can be customized:

- `--delimiter <char>` - CSV delimiter
- `--header-rows <numbers>` - Header row indices (JSON array)
- `--sample-rows <number>` - Sample size for schema inference
- `--confidence <number>` - Confidence threshold for type detection
- `--column-types <json>` - Override types for specific columns
- `--keep-strings` - Keep original string types
- `--comma-decimal` - Treat comma as decimal separator
- `--month-first` - Parse dates as month-first

### Generated Descriptor

Example generated dataset descriptor:

```json
{
  "resources": [
    {
      "name": "users",
      "data": "users.csv",
      "format": {
        "name": "csv",
        "delimiter": ","
      },
      "tableSchema": {
        "properties": {
          "id": { "type": "integer" },
          "name": { "type": "string" },
          "email": { "type": "string" },
          "created_at": { "type": "date" }
        },
        "required": ["id", "name", "email"]
      }
    },
    {
      "name": "orders",
      "data": "orders.csv",
      "format": {
        "name": "csv"
      },
      "tableSchema": {
        "properties": {
          "order_id": { "type": "integer" },
          "user_id": { "type": "integer" },
          "amount": { "type": "number" },
          "status": { "type": "string" }
        }
      }
    }
  ]
}
```

## Copy Dataset

Copy a dataset and all its resources to a local folder:

```bash
# Copy dataset to local folder
fairspec dataset copy dataset.json --to-path ./local-dataset

# Copy remote dataset
fairspec dataset copy https://example.com/dataset.json --to-path ./dataset

# Silent mode for automation
fairspec dataset copy dataset.json --to-path ./output --silent
```

### Copy Behavior

The copy command:

- Downloads all remote resources
- Preserves directory structure
- Updates resource paths in the descriptor to point to local files
- Creates the target directory if it doesn't exist
- Saves the updated descriptor to the target location

### Options

- `--to-path <path>` (required) - Target directory path
- `--silent` - Suppress output messages
- `--debug` - Show debug information
- `--json` - Output as JSON

### Example

Given a dataset with remote resources:

```json
{
  "resources": [
    {
      "name": "users",
      "data": "https://example.com/data/users.csv"
    },
    {
      "name": "products",
      "data": "https://example.com/data/products.csv"
    }
  ]
}
```

After copying:

```bash
fairspec dataset copy dataset.json --to-path ./local
```

Results in:

```
./local/
  dataset.json   # Updated descriptor
  users.csv          # Downloaded resource
  products.csv       # Downloaded resource
```

## Validate Dataset

Validate a dataset descriptor and all its resources:

```bash
# Validate local dataset
fairspec dataset validate dataset.json

# Validate remote dataset
fairspec dataset validate https://example.com/dataset.json

# Output validation report as JSON
fairspec dataset validate dataset.json --json
```

### Validation Checks

The validate command checks:

- **Descriptor validity** - Valid JSON and conforms to Data Package spec
- **Resource existence** - All referenced resources can be loaded
- **Schema validation** - Each resource validates against its Table Schema
- **Referential integrity** - Foreign key relationships are valid
- **Format compliance** - Resources match their declared formats

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
      "type": "dataset/resource-not-found",
      "resourceName": "users",
      "message": "Resource file 'users.csv' not found"
    },
    {
      "type": "table/schema",
      "resourceName": "orders",
      "rowNumber": 15,
      "propertyName": "amount",
      "message": "value must be a number"
    },
    {
      "type": "dataset/foreign-key",
      "resourceName": "orders",
      "message": "Foreign key 'user_id' references non-existent value in 'users'"
    }
  ]
}
```

### Options

- `--debug` - Show debug information
- `--json` - Output as JSON

## List Resources

List all resources in a dataset:

```bash
# List resources
fairspec dataset list dataset.json

# List from remote dataset
fairspec dataset list https://example.com/dataset.json

# Output as JSON array
fairspec dataset list dataset.json --json
```

### Output

Returns an array of resource names in the dataset:

Text output:

```
users
products
orders
transactions
```

JSON output:

```json
["users", "products", "orders", "transactions"]
```

### Options

- `--debug` - Show debug information
- `--json` - Output as JSON

## Interactive Scripting

Start an interactive REPL session with a loaded dataset:

```bash
# Load dataset and start REPL
fairspec dataset script dataset.json

# Script remote dataset
fairspec dataset script https://example.com/dataset.json
```

### Available in Session

- `fairspec` - Full fairspec library
- `dataset` - Loaded dataset descriptor

### Example Session

```javascript
fairspec> dataset
{
  resources: [
    { name: 'users', data: 'users.csv', ... },
    { name: 'orders', data: 'orders.csv', ... }
  ]
}

fairspec> dataset.resources.length
2

fairspec> dataset.resources[0].name
'users'

fairspec> const table = await fairspec.loadTable(dataset.resources[0])
fairspec> await table.head(5).collect()
DataFrame { ... }
```

## Common Workflows

### Create Dataset from Files

```bash
# 1. Infer dataset from multiple files
fairspec dataset infer data/*.csv --json > dataset.json

# 2. Manually edit dataset.json to add:
#    - Title and description
#    - License information
#    - Foreign key relationships
#    - Additional metadata

# 3. Validate the dataset
fairspec dataset validate dataset.json

# 4. List resources to confirm
fairspec dataset list dataset.json
```

### Clone Remote Dataset

```bash
# 1. Copy remote dataset locally
fairspec dataset copy https://example.com/dataset.json --to-path ./local-data

# 2. Validate local copy
fairspec dataset validate ./local-data/dataset.json

# 3. List resources
fairspec dataset list ./local-data/dataset.json
```

### Dataset Quality Assurance

```bash
# 1. Validate the dataset
fairspec dataset validate dataset.json

# 2. If validation fails, check individual resources
fairspec table validate --from-dataset dataset.json --from-resource users

# 3. Inspect resource schemas
fairspec table infer-schema --from-dataset dataset.json --from-resource users

# 4. Generate schema documentation
fairspec table render-schema schema.json --to-format markdown --to-path docs/users-schema.md
```

### Dataset Evolution

```bash
# 1. Start with existing dataset
fairspec dataset validate old-dataset.json

# 2. Add new data files
fairspec dataset infer old-data/*.csv new-data/*.csv --json > dataset.json

# 3. Merge metadata from old descriptor
# (manual step - copy title, license, etc.)

# 4. Validate updated dataset
fairspec dataset validate dataset.json

# 5. Verify all resources
fairspec dataset list dataset.json
```

### Automation and CI/CD

```bash
#!/bin/bash

# Validate dataset in CI pipeline
if fairspec dataset validate dataset.json --json | jq -e '.valid'; then
  echo "✓ Dataset validation passed"
  exit 0
else
  echo "✗ Dataset validation failed"
  fairspec dataset validate dataset.json
  exit 1
fi
```

## Output Formats

### Text Output (default)

Human-readable output with colors and formatting:

```bash
fairspec dataset list dataset.json
```

Output:

```
users
products
orders
```

### JSON Output

Machine-readable JSON for automation and scripting:

```bash
fairspec dataset validate dataset.json --json
```

### Silent Mode

Suppress all output except errors (for copy command):

```bash
fairspec dataset copy dataset.json --to-path ./output --silent
```

Use exit code to check success:

```bash
if fairspec dataset copy dataset.json --to-path ./output --silent; then
  echo "Success"
else
  echo "Failed"
fi
```

## Examples

### Create Multi-Table Dataset

```bash
# Prepare your data files
# - customers.csv
# - orders.csv
# - products.csv

# Infer the dataset
fairspec dataset infer customers.csv orders.csv products.csv --json > dataset.json

# Enhance the descriptor
cat > dataset.json << 'EOF'
{
  "name": "sales-data",
  "title": "Sales Database Export",
  "description": "Customer orders and product catalog",
  "license": "CC-BY-4.0",
  "resources": [
    {
      "name": "customers",
      "data": "customers.csv",
      "tableSchema": { "properties": { ... } }
    },
    {
      "name": "orders",
      "data": "orders.csv",
      "tableSchema": {
        "properties": { ... },
        "foreignKeys": [
          {
            "columns": ["customer_id"],
            "reference": {
              "resource": "customers",
              "columns": ["id"]
            }
          }
        ]
      }
    }
  ]
}
EOF

# Validate
fairspec dataset validate dataset.json
```

### Download and Validate Public Dataset

```bash
# Copy public dataset
fairspec dataset copy https://data.example.org/climate/dataset.json \
  --to-path ./climate-data

# Validate local copy
fairspec dataset validate ./climate-data/dataset.json

# List available resources
fairspec dataset list ./climate-data/dataset.json

# Explore specific resource
fairspec table describe --from-dataset ./climate-data/dataset.json \
  --from-resource temperature
```

### Dataset Testing

```bash
# test-dataset.sh

echo "Testing dataset integrity..."

# 1. Validate descriptor
if ! fairspec dataset validate dataset.json --silent; then
  echo "✗ Dataset validation failed"
  fairspec dataset validate dataset.json
  exit 1
fi

# 2. Check all resources exist
for resource in $(fairspec dataset list dataset.json --json | jq -r '.[]'); do
  echo "Checking resource: $resource"
  if ! fairspec table describe --from-dataset dataset.json --from-resource "$resource" --silent; then
    echo "✗ Resource $resource could not be loaded"
    exit 1
  fi
done

echo "✓ All tests passed"
```

### Interactive Data Exploration

```bash
# Start interactive session
fairspec dataset script dataset.json

# In REPL, explore the dataset:
```

```javascript
// List all resources
dataset.resources.map(r => r.name)

// Load a specific resource
const users = await fairspec.loadTable(dataset.resources.find(r => r.name === "users"))

// Query the data
const activeUsers = await users.filter(pl.col("active").eq(true)).collect()
console.log(activeUsers)

// Check schema
console.log(dataset.resources[0].tableSchema)
```

## Working with Resources

All dataset commands integrate with table commands through the `--from-dataset` and `--from-resource` options:

```bash
# Load resource from dataset
fairspec table describe --from-dataset dataset.json --from-resource users

# Query resource
fairspec table query --from-dataset dataset.json --from-resource orders \
  "SELECT * FROM self WHERE status = 'shipped'"

# Validate resource
fairspec table validate --from-dataset dataset.json --from-resource products

# Infer resource schema
fairspec table infer-schema --from-dataset dataset.json --from-resource users
```

This approach allows you to:

- Work with resources without specifying paths or formats
- Use embedded Table Schemas automatically
- Maintain consistency across your dataset
- Simplify command-line usage
