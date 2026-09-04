import { writeTempFile } from "@fairspec/dataset"
import type { Resource } from "@fairspec/metadata"
import { describe, expect, it } from "vite-plus/test"
import { loadTable } from "../load.ts"

describe("loadTable", () => {
  it("should load table from CSV file", async () => {
    const path = await writeTempFile("id,name\n1,alice\n2,bob")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const table = await loadTable(resource)
    const frame = await table?.collect()

    expect(frame?.toRecords()).toEqual([
      { id: 1, name: "alice" },
      { id: 2, name: "bob" },
    ])
  })

  it("should load table from inline data", async () => {
    const resource: Resource = {
      data: [
        { id: 1, name: "alice" },
        { id: 2, name: "bob" },
      ],
    }

    const table = await loadTable(resource)
    const frame = await table?.collect()

    expect(frame?.toRecords()).toEqual([
      { id: 1, name: "alice" },
      { id: 2, name: "bob" },
    ])
  })

  it("should load table with custom delimiter", async () => {
    const path = await writeTempFile("id|name\n1|alice\n2|bob")
    const resource: Resource = {
      data: path,
      fileDialect: { format: "csv", delimiter: "|" },
    }

    const table = await loadTable(resource)
    const frame = await table?.collect()

    expect(frame?.toRecords()).toEqual([
      { id: 1, name: "alice" },
      { id: 2, name: "bob" },
    ])
  })
})
