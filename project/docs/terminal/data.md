---
title: Working with JSON Data in Terminal
label: Data
path: /terminal/data/
order: 3
---

JSON data validation and schema operations using JSON Schema standards.

## Available Commands

The `fairspec data` command provides utilities for working with JSON data:

- `validate` - Validate JSON data against a Data Schema (JSON Schema)
- `infer-schema` - Automatically generate a Data Schema from JSON data
- `validate-schema` - Validate a Data Schema itself
- `infer-dialect` - Infer file dialect

## Validate JSON Data

Validate JSON data files against a Data Schema (JSON Schema):

```bash
# Validate JSON data with a schema
fairspec data validate data.json --schema schema.json

# Validate from a remote source
fairspec data validate https://example.com/data.json --schema schema.json

# Output validation report as JSON
fairspec data validate data.json --schema schema.json --json
```

### Options

- `--schema <path>` (required) - Path to a Data Schema descriptor (JSON Schema)
- `--silent` - Suppress output messages
- `--debug` - Show debug information
- `--json` - Output as JSON

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
      "type": "data",
      "instancePath": "/users/0/email",
      "schemaPath": "#/properties/users/items/properties/email/format",
      "keyword": "format",
      "message": "must match format \"email\""
    }
  ]
}
```

### Example Usage

Create a JSON Schema file (`user-schema.json`):

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "email": { "type": "string", "format": "email" },
    "age": { "type": "integer", "minimum": 0 }
  },
  "required": ["name", "email"]
}
```

Validate data against the schema:

```bash
fairspec data validate user.json --schema user-schema.json
```

## Infer Data Schema

Automatically generate a Data Schema (JSON Schema) from JSON data:

```bash
# Infer schema from local file
fairspec data infer-schema data.json

# Infer schema from remote file
fairspec data infer-schema https://example.com/data.json

# Save inferred schema to file
fairspec data infer-schema data.json --json > schema.json

# Output for human reading
fairspec data infer-schema data.json
```

### Options

- `--silent` - Suppress output messages
- `--debug` - Show debug information
- `--json` - Output as JSON

### Generated Schema

The inferred schema will automatically detect:

- Data types (string, number, integer, boolean, null)
- Object structures and nested properties
- Array items and their types
- Required properties based on presence
- Enum values for properties with limited options

### Example

Given this JSON data (`users.json`):

```json
[
  {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "age": 30,
    "active": true
  },
  {
    "id": 2,
    "name": "Bob",
    "email": "bob@example.com",
    "age": 25,
    "active": false
  }
]
```

Infer the schema:

```bash
fairspec data infer-schema users.json --json
```

Generated schema:

```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": { "type": "integer" },
      "name": { "type": "string" },
      "email": { "type": "string" },
      "age": { "type": "integer" },
      "active": { "type": "boolean" }
    },
    "required": ["id", "name", "email", "age", "active"]
  }
}
```

## Validate Data Schema

Validate that a Data Schema (JSON Schema) file is valid:

```bash
# Validate a schema file
fairspec data validate-schema schema.json

# Validate from remote source
fairspec data validate-schema https://example.com/schema.json

# Output as JSON
fairspec data validate-schema schema.json --json
```

### Options

- `--silent` - Suppress output messages
- `--debug` - Show debug information
- `--json` - Output as JSON

### Schema Validation

This validates that the schema itself is:

- Valid JSON
- Compliant with JSON Schema Draft 2020-12 specification
- Has correct property definitions
- Uses valid keywords and formats

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
      "message": "Invalid schema property: 'typ' (did you mean 'type'?)"
    }
  ]
}
```

## Infer File Dialect

Automatically detect the dialect of a data file:

```bash
# Infer dialect from file
fairspec data infer-dialect data.json

# Infer from remote file
fairspec data infer-dialect https://example.com/data.jsonl

# Output as JSON
fairspec data infer-dialect data.json --json
```

### Options

- `--sample-bytes <bytes>` - Sample size in bytes for file dialect detection
- `--silent` - Suppress output messages
- `--debug` - Show debug information
- `--json` - Output as JSON

### Detected Formats

The command can detect:

- `json` - Standard JSON format
- `jsonl` - JSON Lines (newline-delimited JSON)

### Example Output

```json
{
  "name": "json"
}
```

Or for JSONL:

```json
{
  "name": "jsonl"
}
```

## Common Workflows

### Create and Validate with Schema

```bash
# 1. Infer schema from existing data
fairspec data infer-schema sample-data.json --json > data-schema.json

# 2. Validate new data against the schema
fairspec data validate new-data.json --schema data-schema.json

# 3. Check if validation passed
if [ $? -eq 0 ]; then
  echo "Data is valid!"
else
  echo "Data validation failed"
fi
```

### Schema-Driven Development

```bash
# 1. Create a schema for your data structure
cat > api-schema.json << 'EOF'
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "users": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "integer" },
          "username": { "type": "string", "minLength": 3 },
          "email": { "type": "string", "format": "email" }
        },
        "required": ["id", "username", "email"]
      }
    }
  }
}
EOF

# 2. Validate the schema itself
fairspec data validate-schema api-schema.json

# 3. Validate API responses against the schema
fairspec data validate response.json --schema api-schema.json
```

### Automated Testing

```bash
# Validate data in a test script
for file in test-data/*.json; do
  echo "Validating $file..."
  if fairspec data validate "$file" --schema schema.json --silent; then
    echo "✓ $file is valid"
  else
    echo "✗ $file failed validation"
    exit 1
  fi
done
```

## Output Formats

### Text Output (default)

Human-readable output with colors and formatting:

```bash
fairspec data validate data.json --schema schema.json
```

Output:

```
✓ Data is valid
```

Or with errors:

```
✗ Data validation failed

Errors:
  • /users/0/email: must match format "email"
  • /users/1/age: must be >= 0
```

### JSON Output

Machine-readable JSON for automation and scripting:

```bash
fairspec data validate data.json --schema schema.json --json
```

### Silent Mode

Suppress all output except errors:

```bash
fairspec data validate data.json --schema schema.json --silent
```

Use exit code to check success:

```bash
if fairspec data validate data.json --schema schema.json --silent; then
  echo "Valid"
else
  echo "Invalid"
fi
```

## Examples

### API Response Validation

```bash
# Fetch API response and validate
curl -s https://api.example.com/users > response.json
fairspec data infer-schema response.json --json > api-schema.json

# Validate future responses
curl -s https://api.example.com/users | \
  fairspec data validate /dev/stdin --schema api-schema.json
```

### Configuration File Validation

```bash
# Create schema for config files
cat > config-schema.json << 'EOF'
{
  "type": "object",
  "properties": {
    "host": { "type": "string" },
    "port": { "type": "integer", "minimum": 1, "maximum": 65535 },
    "ssl": { "type": "boolean" }
  },
  "required": ["host", "port"]
}
EOF

# Validate config file
fairspec data validate config.json --schema config-schema.json
```

### Data Pipeline Validation

```bash
# Validate input data
fairspec data validate input.json --schema input-schema.json

# Process data (your custom script)
./process-data.sh input.json output.json

# Validate output data
fairspec data validate output.json --schema output-schema.json
```

### Schema Evolution

```bash
# Start with inferred schema from v1 data
fairspec data infer-schema data-v1.json --json > schema-v1.json

# Manually update schema for v2 (add optional properties)
# Edit schema-v1.json -> schema-v2.json

# Validate that v2 schema is still valid
fairspec data validate-schema schema-v2.json

# Ensure v1 data is still compatible with v2 schema
fairspec data validate data-v1.json --schema schema-v2.json
```
