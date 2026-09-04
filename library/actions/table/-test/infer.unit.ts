import { writeTempFile } from "@fairspec/dataset"
import type { Resource } from "@fairspec/metadata"
import { describe, expect, it } from "vite-plus/test"
import { inferTable } from "../infer.ts"

describe("inferTable", () => {
  it("should infer table from CSV file", async () => {
    const path = await writeTempFile("id,name\n1,alice\n2,bob")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const result = await inferTable(resource)
    expect(result?.fileDialect).toEqual({ format: "csv" })
    expect(result?.tableSchema).toEqual({
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
      },
    })
  })

  it("should infer table from inline data", async () => {
    const resource: Resource = {
      data: [
        { id: 1, name: "alice" },
        { id: 2, name: "bob" },
      ],
    }

    const result = await inferTable(resource)
    expect(result?.tableSchema).toEqual({
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
      },
    })
  })

  it("should use provided tableSchema", async () => {
    const path = await writeTempFile("id,name\n1,alice\n2,bob")
    const resource: Resource = {
      data: path,
      fileDialect: { format: "csv" },
      tableSchema: {
        properties: {
          id: { type: "string" },
          name: { type: "string" },
        },
      },
    }

    const result = await inferTable(resource)
    expect(result?.fileDialect).toEqual({ format: "csv" })
    expect(result?.tableSchema).toEqual({
      properties: {
        id: { type: "string" },
        name: { type: "string" },
      },
    })
  })
})
