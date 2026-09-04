---
title: Working with Datasets in TypeScript
label: Dataset
path: /typescript/dataset/
order: 1
---

A dataset is a collection of related data resources (tables and files) with metadata, table schemas, and relationships. The `fairspec` package provides a programming API to load, infer, validate, and save datasets across the supported plugins — local folders, Zip archives, GitHub repositories, Zenodo deposits, and CKAN portals.

## Installation

```bash
npm install fairspec
```

## Getting Started

The dataset API provides these top-level utilities:

- `loadDataset` - Load a dataset descriptor from a local or remote source
- `saveDataset` - Save a dataset to a folder, Zip archive, or external service
- `inferDataset` - Infer a dataset descriptor from a list of files
- `validateDataset` - Validate a dataset descriptor and all its resources

```ts
import { loadDataset, validateDataset } from "fairspec"

const dataset = await loadDataset("dataset.json")
const report = await validateDataset(dataset)
```

## Loading a Dataset

`loadDataset(source)` dispatches to the first plugin that recognises the source. The bundled plugins resolve `folder`, `zip`, `github`, `zenodo`, and `ckan` sources automatically.

```ts
import { loadDataset } from "fairspec"

const local = await loadDataset("./datasets/sales/dataset.json")

const remote = await loadDataset("https://example.com/datasets/sales/dataset.json")

const folder = await loadDataset("./datasets/sales")

const zip = await loadDataset("./datasets/sales.zip")

const repo = await loadDataset("https://github.com/datisthq/example-dataset")
```

The returned value is a `Dataset` — a JSON-compatible object containing `resources`, metadata fields, and any extension properties.

```ts
import { loadDataset } from "fairspec"

const dataset = await loadDataset("dataset.json")
console.log(dataset.title)
console.log(dataset.resources?.length)
```

If no plugin can load the source, `loadDataset` throws.

## Saving a Dataset

`saveDataset(dataset, options)` writes a dataset to a target location. The `target` option selects the plugin (folder path, Zip archive path, or remote URL).

```ts
import { loadDataset, saveDataset } from "fairspec"

const dataset = await loadDataset("https://example.com/datasets/sales/dataset.json")

await saveDataset(dataset, { target: "./local-sales" })

await saveDataset(dataset, { target: "./sales.zip" })

await saveDataset(dataset, {
  target: "./local-sales",
  withRemote: true,
})
```

By default the plugin updates resource paths in the saved descriptor to point at local copies. Set `withRemote: true` to also download remote files into the target folder.

## Inferring a Dataset

`inferDataset(dataset, options?)` walks `dataset.resources` and fills in missing format and schema details by running per-resource inference in parallel. It does **not** take a path — pass a dataset with at least the `data` paths of each resource.

```ts
import { inferDataset } from "fairspec"

const dataset = await inferDataset({
  resources: [{ data: "users.csv" }, { data: "orders.csv" }, { data: "products.csv" }],
})

console.log(dataset.resources?.[0]?.tableSchema)
```

Customise the inference per-column or per-format with the second argument:

```ts
import { inferDataset } from "fairspec"

const dataset = await inferDataset(
  { resources: [{ data: "products.csv" }] },
  {
    sampleRows: 1000,
    confidence: 0.95,
    columnTypes: { sku: "string" },
  },
)
```

The result is a new `Dataset` object — combine it with `saveDataset` to persist a descriptor:

```ts
import { inferDataset, saveDataset } from "fairspec"

const dataset = await inferDataset({
  resources: [{ data: "users.csv" }, { data: "orders.csv" }],
})

await saveDataset(dataset, { target: "./inferred-dataset" })
```

## Validating a Dataset

`validateDataset(source)` accepts either a path or an in-memory `Dataset` value. It loads the descriptor, validates every resource against its schema, and checks foreign-key relationships, returning a report.

```ts
import { validateDataset } from "fairspec"

const report = await validateDataset("dataset.json")

if (report.valid) {
  console.log("Dataset is valid")
} else {
  for (const error of report.errors) {
    console.error(error.type, error)
  }
}
```

When you already have a dataset in memory, pass it directly to skip the load step:

```ts
import { loadDataset, validateDataset } from "fairspec"

const dataset = await loadDataset("dataset.json")
const report = await validateDataset(dataset)
```

## Working with Resources

`dataset.resources` is an array of `Resource` descriptors. Each resource has a `data` path (local or remote), an optional `fileDialect`, and either a `tableSchema` (table resources) or a `dataSchema` (JSON data resources).

```ts
import type { Resource } from "fairspec"
import { loadDataset, loadTable } from "fairspec"

const dataset = await loadDataset("dataset.json")

const usersResource = dataset.resources?.find(r => r.name === "users")
if (!usersResource) throw new Error("Missing users resource")

const users = await loadTable(usersResource)
const frame = await users?.collect()
console.log(frame?.toRecords())
```

The same `Resource` shape is what `loadTable`, `loadData`, `loadFile`, `validateTable`, `validateData`, and `validateFile` accept — datasets and individual resources share a single API surface.

## Common Workflows

### Create a dataset from data files

```ts
import { inferDataset, saveDataset, validateDataset } from "fairspec"

const dataset = await inferDataset({
  resources: [
    { name: "customers", data: "customers.csv" },
    { name: "orders", data: "orders.csv" },
    { name: "products", data: "products.csv" },
  ],
})

dataset.title = "Sales Database Export"
dataset.description = "Customer orders and product catalog"

await saveDataset(dataset, { target: "./sales-dataset" })

const report = await validateDataset("./sales-dataset/dataset.json")
console.log(report.valid)
```

### Clone a remote dataset locally

```ts
import { loadDataset, saveDataset, validateDataset } from "fairspec"

const remote = await loadDataset("https://example.com/datasets/climate")
await saveDataset(remote, { target: "./climate", withRemote: true })

const report = await validateDataset("./climate/dataset.json")
if (!report.valid) {
  console.error(report.errors)
}
```

### Dataset CI check

```ts
import { validateDataset } from "fairspec"

const report = await validateDataset("dataset.json")
if (!report.valid) {
  for (const error of report.errors) {
    console.error(`${error.type}: ${JSON.stringify(error)}`)
  }
  process.exit(1)
}
```

## Examples

### Convert a folder to a Zip archive

```ts
import { loadDataset, saveDataset } from "fairspec"

const dataset = await loadDataset("./sales-dataset")
await saveDataset(dataset, { target: "./sales-dataset.zip", withRemote: true })
```

### Refresh schemas from current data

```ts
import { loadDataset, inferDataset, saveDataset } from "fairspec"

const dataset = await loadDataset("dataset.json")
const refreshed = await inferDataset(dataset, { sampleRows: 1000 })
await saveDataset(refreshed, { target: "./dataset-v2" })
```

### Aggregate validation errors by resource

```ts
import { validateDataset } from "fairspec"

const report = await validateDataset("dataset.json")

const byResource = new Map<string, number>()
for (const error of report.errors) {
  const key = String(error.resourceName ?? "?")
  byResource.set(key, (byResource.get(key) ?? 0) + 1)
}

for (const [name, count] of byResource) {
  console.log(`${name}: ${count} error(s)`)
}
```
