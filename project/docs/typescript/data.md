---
title: Working with JSON Data in TypeScript
label: Data
path: /typescript/data/
order: 3
---

Load and validate arbitrary JSON data resources against a Data Schema (JSON Schema Draft 2020-12). The `fairspec` API treats JSON documents — objects and arrays alike — as first-class resources, alongside tables and files.

## Installation

```bash
npm install fairspec
```

## Getting Started

The data API provides three top-level utilities:

- `loadData` - Read a JSON value from a local or remote resource
- `validateData` - Validate JSON data against a Data Schema
- `inferDataSchema` - Generate a JSON Schema from existing data

```ts
import { loadData, validateData } from "fairspec"

const data = await loadData({ data: "users.json" })

const report = await validateData({
  data: "users.json",
  dataSchema: "users.schema.json",
})
```

## Loading Data

`loadData(resource)` returns the parsed JSON value if the resource points to a JSON file or carries an inline JSON value. The return type is `Record<string, unknown> | unknown[] | undefined`.

```ts
import { loadData } from "fairspec"

const local = await loadData({ data: "config.json" })

const remote = await loadData({ data: "https://example.com/config.json" })

const inline = await loadData({
  data: { host: "localhost", port: 5432 },
})
```

If the resource cannot be loaded as JSON, `loadData` returns `undefined`. Use `validateData` for full reporting of schema errors.

## Validating Data

`validateData(resource)` validates the resource's data against its `dataSchema` and returns a report.

```ts
import { validateData } from "fairspec"

const report = await validateData({
  data: "users.json",
  dataSchema: "users.schema.json",
})

if (report.valid) {
  console.log("Data is valid")
} else {
  for (const error of report.errors) {
    console.error(error.type, error)
  }
}
```

The schema can also be inlined directly into the resource:

```ts
import type { DataSchema } from "fairspec"
import { validateData } from "fairspec"

const dataSchema: DataSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    email: { type: "string", format: "email" },
    age: { type: "integer", minimum: 0 },
  },
  required: ["name", "email"],
}

const report = await validateData({ data: "user.json", dataSchema })
```

If the resource has no `dataSchema`, the report is empty (no schema, no errors).

## Inferring a Data Schema

`inferDataSchema(resource)` returns a JSON Schema generated from the resource's actual data — useful for bootstrapping a schema you can hand-edit.

```ts
import { inferDataSchema } from "fairspec"

const schema = await inferDataSchema({ data: "users.json" })

console.log(JSON.stringify(schema, null, 2))
```

The inferred schema detects types, required properties, array item types, and nested object structures. It's a starting point — add constraints (`format`, `minimum`, `pattern`, `enum`) by hand to enforce stricter validation.

```ts
import { inferDataSchema, validateData } from "fairspec"

const schema = await inferDataSchema({ data: "sample.json" })
if (!schema) throw new Error("Could not infer schema")

const report = await validateData({
  data: "production.json",
  dataSchema: schema,
})
```

## Common Workflows

### Bootstrap a schema and validate fresh data

```ts
import { inferDataSchema, validateData } from "fairspec"

const dataSchema = await inferDataSchema({ data: "sample-response.json" })
if (!dataSchema) throw new Error("Could not infer schema")

const report = await validateData({
  data: "live-response.json",
  dataSchema,
})

if (!report.valid) {
  console.error(report.errors)
}
```

### Validate API responses

```ts
import { validateData } from "fairspec"

const response = await fetch("https://api.example.com/users").then(r => r.json())

const report = await validateData({
  data: response,
  dataSchema: "users.schema.json",
})

if (!report.valid) {
  for (const error of report.errors) {
    console.error(error)
  }
}
```

### Validate configuration before app startup

```ts
import { validateData } from "fairspec"

const report = await validateData({
  data: "config.json",
  dataSchema: "config.schema.json",
})

if (!report.valid) {
  console.error("Invalid configuration:")
  for (const error of report.errors) {
    console.error(`  ${JSON.stringify(error)}`)
  }
  process.exit(1)
}
```

## Examples

### Validate a directory of JSON files

```ts
import { readdir } from "node:fs/promises"
import { validateData } from "fairspec"

const files = await readdir("./responses")

let failures = 0
for (const file of files.filter(f => f.endsWith(".json"))) {
  const report = await validateData({
    data: `./responses/${file}`,
    dataSchema: "response.schema.json",
  })

  if (!report.valid) {
    failures += 1
    console.error(`${file}: ${report.errors.length} error(s)`)
  }
}

process.exit(failures === 0 ? 0 : 1)
```

### Schema evolution check

```ts
import { validateData } from "fairspec"

const v1Report = await validateData({
  data: "data-v1.json",
  dataSchema: "schema-v2.json",
})

if (!v1Report.valid) {
  console.error("v1 data is no longer compatible with v2 schema:")
  console.error(v1Report.errors)
}
```

### Build a schema from sample data

```ts
import { writeFile } from "node:fs/promises"
import { inferDataSchema } from "fairspec"

const dataSchema = await inferDataSchema({ data: "sample.json" })
if (!dataSchema) throw new Error("Could not infer schema")

await writeFile("schema.json", JSON.stringify(dataSchema, null, 2))
```
