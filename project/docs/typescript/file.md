---
title: Working with Files in TypeScript
label: File
path: /typescript/file/
order: 4
---

Read, write, copy, describe, and validate local or remote files at the byte level. The file API works on any path — local paths, HTTP/HTTPS URLs, or paths inside a dataset — and underpins higher-level operations like loading tables and validating dataset resources.

## Installation

```bash
npm install fairspec
```

## Getting Started

The file API provides these top-level utilities:

- `loadFile` - Read a file's contents into a `Buffer`
- `saveFile` - Write a `Buffer` to a local path
- `copyFile` - Copy a file from one path to another
- `describeFile` - Get size, encoding, and integrity hash for a file
- `validateFile` - Check that a resource matches its declared integrity and `textual` flag
- `prefetchFiles` - Download remote resources to local temp paths
- `inferTextual`, `inferIntegrity` - Building blocks used by the validators

```ts
import { describeFile, loadFile } from "fairspec"

const buffer = await loadFile("data.csv")
const info = await describeFile("data.csv", { hashType: "sha256" })
```

## Loading a File

`loadFile(path, options?)` returns the file contents as a `Buffer`. It supports local and remote paths.

```ts
import { loadFile } from "fairspec"

const local = await loadFile("data.csv")

const remote = await loadFile("https://example.com/data.csv")

const preview = await loadFile("large.csv", { maxBytes: 4096 })
```

Use `maxBytes` to cap how much is read — useful when sampling a file just for format detection.

## Saving a File

`saveFile(path, buffer, options?)` writes a `Buffer` to a local path. Pass `overwrite: true` to replace an existing file.

```ts
import { saveFile } from "fairspec"

const buffer = Buffer.from("hello,world\n1,2\n")
await saveFile("output.csv", buffer)

await saveFile("output.csv", buffer, { overwrite: true })
```

For streaming writes or large outputs, use `loadFile` followed by `copyFile` to avoid buffering everything in memory.

## Describing a File

`describeFile(path, options?)` returns `bytes`, `textual`, and `integrity` (a `{ type, hash }` object). It fetches remote files into a temp location first so the result is identical regardless of source.

```ts
import { describeFile } from "fairspec"

const info = await describeFile("data.csv")
console.log(info.bytes)
console.log(info.textual)
console.log(info.integrity)

const sha256 = await describeFile("data.csv", { hashType: "sha256" })
const md5 = await describeFile("data.csv", { hashType: "md5" })
```

Supported `hashType` values are `md5`, `sha1`, `sha256` (default), and `sha512`.

## Validating a File

`validateFile(resource)` checks two declared properties on a resource:

- `textual` — verifies the file is valid UTF-8 / ASCII
- `integrity` — recomputes the hash and compares to the declared value

```ts
import { validateFile } from "fairspec"

const report = await validateFile({
  data: "data.csv",
  textual: true,
  integrity: {
    type: "sha256",
    hash: "a1b2c3d4e5f6...",
  },
})

if (!report.valid) {
  for (const error of report.errors) {
    console.error(error.type, error)
  }
}
```

If `textual` and `integrity` are both omitted, the report is empty — there's nothing to check.

## Copying a File

`copyFile({ sourcePath, targetPath, maxBytes? })` streams data from `sourcePath` to `targetPath`. Both can be local; the source can also be a remote URL.

```ts
import { copyFile } from "fairspec"

await copyFile({
  sourcePath: "https://example.com/data.csv",
  targetPath: "./local-data.csv",
})

await copyFile({
  sourcePath: "./input.csv",
  targetPath: "./output.csv",
  maxBytes: 1024 * 1024,
})
```

Unlike `saveFile`, `copyFile` is streaming — memory usage stays low even for large files.

## Prefetching Remote Files

`prefetchFiles(resource, options?)` downloads every remote path in a resource into temp files and returns the local paths. Local paths are passed through unchanged.

```ts
import { prefetchFiles } from "fairspec"

const localPaths = await prefetchFiles({
  data: ["https://example.com/part1.csv", "https://example.com/part2.csv"],
})

console.log(localPaths)
```

This is the same primitive used internally by `describeFile`, `loadTable`, and friends. Use it directly when you need offline copies before subsequent processing.

## Lower-level Helpers

`inferTextual` and `inferIntegrity` are the building blocks behind `describeFile` and `validateFile`:

```ts
import { inferIntegrity, inferTextual } from "fairspec"

const textual = await inferTextual({ data: "data.csv" })
const integrity = await inferIntegrity({ data: "data.csv" }, { hashType: "sha256" })
```

`inferTextual` samples the first 10 KB by default and uses encoding detection; pass `sampleBytes` and `confidencePercent` to tune sensitivity.

## Common Workflows

### Snapshot a remote file with its hash

```ts
import { copyFile, describeFile } from "fairspec"

await copyFile({
  sourcePath: "https://example.com/data.csv",
  targetPath: "./snapshot.csv",
})

const info = await describeFile("./snapshot.csv", { hashType: "sha256" })
console.log(info.integrity)
```

### Verify a downloaded file matches its declared hash

```ts
import { validateFile } from "fairspec"

const report = await validateFile({
  data: "./downloaded.csv",
  integrity: {
    type: "sha256",
    hash: "expected-hash-here",
  },
})

if (!report.valid) {
  throw new Error("File integrity check failed")
}
```

### Mirror a dataset's files locally

```ts
import { copyFile, loadDataset } from "fairspec"

const dataset = await loadDataset("https://example.com/datasets/sales/dataset.json")

for (const resource of dataset.resources ?? []) {
  const path = typeof resource.data === "string" ? resource.data : undefined
  if (!path) continue

  const localPath = `./mirror/${resource.name ?? "resource"}`
  await copyFile({ sourcePath: path, targetPath: localPath })
}
```

## Examples

### CLI-style hash check

```ts
import { describeFile, validateFile } from "fairspec"

const info = await describeFile("data.csv", { hashType: "sha256" })

const report = await validateFile({
  data: "data.csv",
  integrity: info.integrity,
})

console.log(report.valid)
```

### Detect binary vs. textual files

```ts
import { inferTextual } from "fairspec"
import { readdir } from "node:fs/promises"

const files = await readdir("./inbox")

for (const name of files) {
  const textual = await inferTextual({ data: `./inbox/${name}` })
  console.log(`${name}: ${textual ? "text" : "binary"}`)
}
```

### Build a manifest of file integrities

```ts
import { writeFile } from "node:fs/promises"
import { describeFile } from "fairspec"

const paths = ["a.csv", "b.csv", "c.csv"]

const manifest = await Promise.all(
  paths.map(async path => ({
    path,
    ...(await describeFile(path, { hashType: "sha256" })),
  })),
)

await writeFile("manifest.json", JSON.stringify(manifest, null, 2))
```
