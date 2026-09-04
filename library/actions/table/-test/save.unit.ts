import { readFile } from "node:fs/promises"
import { getTempFilePath, writeTempFile } from "@fairspec/dataset"
import type { Resource } from "@fairspec/metadata"
import { assert, describe, expect, it } from "vite-plus/test"
import { loadTable } from "../load.ts"
import { saveTable } from "../save.ts"

describe("saveTable", () => {
  it("should save table to CSV file", async () => {
    const path = await writeTempFile("id,name\n1,alice\n2,bob")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }
    const table = await loadTable(resource)
    const outputPath = getTempFilePath()

    expect.assert(table)
    await saveTable(table, { path: outputPath, fileDialect: { format: "csv" } })

    const content = await readFile(outputPath, "utf-8")
    expect(content).toBe("id,name\n1,alice\n2,bob\n")
  })

  it("should save and reload table with same data", async () => {
    const resource: Resource = {
      data: [
        { id: 1, name: "alice" },
        { id: 2, name: "bob" },
      ],
    }
    const table = await loadTable(resource)
    const outputPath = getTempFilePath()

    assert(table)
    await saveTable(table, { path: outputPath, fileDialect: { format: "csv" } })
    const reloaded: Resource = {
      data: outputPath,
      fileDialect: { format: "csv" },
    }
    const reloadedTable = await loadTable(reloaded)
    const frame = await reloadedTable?.collect()

    expect(frame?.toRecords()).toEqual([
      { id: 1, name: "alice" },
      { id: 2, name: "bob" },
    ])
  })

  it("should save table with custom delimiter", async () => {
    const path = await writeTempFile("id,name\n1,alice\n2,bob")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }
    const table = await loadTable(resource)
    const outputPath = getTempFilePath()

    expect.assert(table)
    await saveTable(table, {
      path: outputPath,
      fileDialect: { format: "csv", delimiter: "|" },
    })

    const content = await readFile(outputPath, "utf-8")
    expect(content).toBe("id|name\n1|alice\n2|bob\n")
  })

  it("should save table as JSON", async () => {
    const resource: Resource = {
      data: [
        { id: 1, name: "alice" },
        { id: 2, name: "bob" },
      ],
    }
    const table = await loadTable(resource)
    const outputPath = getTempFilePath({ format: "json" })

    expect.assert(table)
    await saveTable(table, {
      path: outputPath,
      fileDialect: { format: "json" },
    })

    const content = await readFile(outputPath, "utf-8")
    expect(JSON.parse(content)).toEqual([
      { id: 1, name: "alice" },
      { id: 2, name: "bob" },
    ])
  })
})
