import { writeTempFile } from "@fairspec/dataset"
import type { Resource } from "@fairspec/metadata"
import { describe, expect, it } from "vite-plus/test"
import { validateTable } from "../validate.ts"

describe("validateTable", () => {
  it("should validate correct tabular data", async () => {
    const path = await writeTempFile("id,name\n1,alice\n2,bob")
    const resource: Resource = {
      data: path,
      fileDialect: { format: "csv" },
      tableSchema: {
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
        },
      },
    }

    const report = await validateTable(resource)

    expect(report.valid).toBe(true)
    expect(report.errors).toHaveLength(0)
  })

  it("should return errors for invalid tabular data", async () => {
    const path = await writeTempFile("id,name\ninvalid,alice\n2,bob")
    const resource: Resource = {
      data: path,
      fileDialect: { format: "csv" },
      tableSchema: {
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
        },
      },
    }

    const report = await validateTable(resource)

    expect(report.valid).toBe(false)
    expect(report.errors).toHaveLength(1)
    expect(report.errors).toContainEqual({
      type: "cell/type",
      columnName: "id",
      columnType: "integer",
      rowNumber: 1,
      cell: "invalid",
    })
  })

  it("should return error when no tabular data", async () => {
    const resource: Resource = {
      name: "empty",
      tableSchema: {
        properties: {
          id: { type: "integer" },
        },
      },
    }

    const report = await validateTable(resource)

    expect(report.valid).toBe(false)
    expect(report.errors).toHaveLength(1)
    expect(report.errors).toContainEqual({
      type: "resource/type",
      expectedResourceType: "table",
    })
  })
})
