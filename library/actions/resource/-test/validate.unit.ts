import { writeTempFile } from "@fairspec/dataset"
import type { Resource } from "@fairspec/metadata"
import { describe, expect, it } from "vite-plus/test"
import { validateResource } from "../validate.ts"

describe("validateResource", () => {
  it("should validate correct tabular data", async () => {
    const path = await writeTempFile("id,name\n1,alice\n2,bob")
    const source: Resource = {
      data: path,
      fileDialect: { format: "csv" },
      tableSchema: {
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
        },
      },
    }

    const report = await validateResource(source)

    expect(report.valid).toBe(true)
    expect(report.errors).toHaveLength(0)
  })

  it("should return errors for invalid tabular data", async () => {
    const path = await writeTempFile("id,name\ninvalid,alice\n2,bob")
    const source: Resource = {
      data: path,
      fileDialect: { format: "csv" },
      tableSchema: {
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
        },
      },
    }

    const report = await validateResource(source)

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

  it("should validate correct inline data with dataSchema", async () => {
    const source: Resource = {
      data: {
        name: "test-package",
        version: "1.0.0",
      },
      dataSchema: {
        type: "object",
        required: ["name", "version"],
        properties: {
          name: { type: "string" },
          version: { type: "string" },
        },
      },
    }

    const report = await validateResource(source)

    expect(report.valid).toBe(true)
    expect(report.errors).toHaveLength(0)
  })

  it("should return errors for invalid dataSchema data", async () => {
    const source: Resource = {
      data: {
        name: "test-package",
        version: 123,
      },
      dataSchema: {
        type: "object",
        required: ["name", "version"],
        properties: {
          name: { type: "string" },
          version: { type: "string" },
        },
      },
    }

    const report = await validateResource(source)

    expect(report.valid).toBe(false)
    expect(report.errors).toHaveLength(1)
  })
})
