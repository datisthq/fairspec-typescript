---
title: Working with Files in Terminal
label: File
path: /terminal/file/
order: 4
---

File operations for copying, describing, validating, and analyzing local or remote files.

## Available Commands

The `fairspec file` command provides utilities for working with files:

- `copy` - Copy local or remote files
- `describe` - Get file statistics and metadata
- `validate` - Validate file integrity
- `infer-dialect` - Infer file dialect

## Copy Files

Copy files from local or remote sources to a local destination:

```bash
# Copy a local file
fairspec file copy data.csv --to-path output.csv

# Copy a remote file
fairspec file copy https://example.com/data.csv --to-path local-data.csv

# Copy from a dataset resource
fairspec file copy --from-dataset dataset.json --from-resource users --to-path users.csv
```

### Options

- `--to-path <path>` (required) - Local output path
- `--from-dataset <path>` - Load file from dataset descriptor
- `--from-resource <name>` - Specify resource name from dataset
- `--silent` - Suppress output messages
- `--debug` - Show debug information
- `--json` - Output as JSON

## Describe Files

Get detailed information about a file including size, type, and checksums:

```bash
# Describe a local file
fairspec file describe data.csv

# Describe with specific hash type
fairspec file describe data.csv --hash-type sha256

# Describe a remote file
fairspec file describe https://example.com/data.csv

# Describe from a dataset
fairspec file describe --from-dataset dataset.json --from-resource users
```

### Output

The describe command returns:

- `bytes` - File size in bytes
- `textual` - Whether the file is text-based
- `integrity` - Hash value and type

### Options

- `--hash-type <type>` - Hash algorithm to use
  - Choices: `md5`, `sha1`, `sha256` (default), `sha512`
- `--from-dataset <path>` - Load file from dataset descriptor
- `--from-resource <name>` - Specify resource name from dataset
- `--silent` - Suppress output messages
- `--debug` - Show debug information
- `--json` - Output as JSON

### Example Output

```json
{
  "bytes": 1024,
  "textual": true,
  "integrity": {
    "type": "sha256",
    "hash": "a1b2c3d4e5f6..."
  }
}
```

## Validate Files

Validate file integrity using checksums:

```bash
# Validate with expected hash
fairspec file validate data.csv --hash a1b2c3d4e5f6 --hash-type sha256

# Validate using MD5
fairspec file validate data.csv --hash 098f6bcd4621 --hash-type md5

# Output as JSON for automation
fairspec file validate data.csv --hash a1b2c3d4 --json
```

### Options

- `--hash <hash>` - Expected file hash
- `--hash-type <type>` - Hash algorithm to use (default: `md5`)
  - Choices: `md5`, `sha1`, `sha256`, `sha512`
- `--silent` - Suppress output messages
- `--debug` - Show debug information
- `--json` - Output as JSON

### Validation Report

Returns a validation report with:

- `valid` - Boolean indicating if validation passed
- `errors` - Array of validation errors (if any)

Example error:

```json
{
  "valid": false,
  "errors": [
    {
      "type": "file/integrity",
      "hashType": "sha256",
      "expectedHash": "a1b2c3d4e5f6...",
      "actualHash": "different..."
    }
  ]
}
```

## Infer File Dialect

Automatically detect the dialect of a file:

```bash
# Infer dialect from file
fairspec file infer-dialect data.csv

# Infer from remote file
fairspec file infer-dialect https://example.com/data.json

# Output as JSON
fairspec file infer-dialect data.xlsx --json
```

### Options

- `--silent` - Suppress output messages
- `--debug` - Show debug information
- `--json` - Output as JSON

### Supported Formats

The command can detect:

- CSV/TSV files
- JSON/JSONL files
- Excel files (.xlsx, .xls)
- OpenDocument Spreadsheet (.ods)
- Parquet files
- Arrow/Feather files
- SQLite databases

## Working with Datasets

All file commands support loading files from dataset descriptors:

```bash
# Describe a resource from a dataset
fairspec file describe --from-dataset dataset.json --from-resource sales-data

# Copy a resource from a dataset
fairspec file copy --from-dataset dataset.json --from-resource users --to-path users.csv

# Validate a resource from a dataset
fairspec file validate --from-dataset dataset.json --from-resource products --hash abc123
```

## Output Formats

### Text Output (default)

Human-readable output with colors and formatting:

```bash
fairspec file describe data.csv
```

### JSON Output

Machine-readable JSON for automation and scripting:

```bash
fairspec file describe data.csv --json
```

### Silent Mode

Suppress all output except errors:

```bash
fairspec file copy data.csv --to-path output.csv --silent
```

## Examples

### Copy and Validate

```bash
# Copy a file and get its hash
fairspec file copy remote-data.csv --to-path local-data.csv
fairspec file describe local-data.csv --hash-type sha256

# Validate the copied file
fairspec file validate local-data.csv --hash <hash-from-describe> --hash-type sha256
```

### Process Dataset Resources

```bash
# Describe all details of a dataset resource
fairspec file describe --from-dataset dataset.json --from-resource sales

# Copy the resource locally
fairspec file copy --from-dataset dataset.json --from-resource sales --to-path sales.csv

# Infer its dialect
fairspec file infer-dialect sales.csv
```

### Automation with JSON

```bash
# Get file info as JSON for scripting
INFO=$(fairspec file describe data.csv --json)
HASH=$(echo $INFO | jq -r '.integrity.hash')

# Use in validation
fairspec file validate data.csv --hash $HASH --hash-type sha256
```
