import type { Dataset } from "@fairspec/metadata"
import { describe, expect, it } from "vite-plus/test"
import { validateDataset } from "../validate.ts"

describe("validateDataset", () => {
  it("should validate a valid dataset with inline data", async () => {
    const source: Dataset = {
      resources: [
        {
          name: "test_resource",
          data: [
            { id: 1, name: "Alice" },
            { id: 2, name: "Bob" },
          ],
          tableSchema: {
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
            },
          },
        },
      ],
    }

    const report = await validateDataset(source)

    expect(report.valid).toBe(true)
    expect(report.errors).toHaveLength(0)
  })

  it("should detect invalid resource data", async () => {
    const source: Dataset = {
      resources: [
        {
          name: "test_resource",
          data: [
            { id: 1, name: "Alice" },
            { id: "not-a-number", name: "Bob" },
          ],
          tableSchema: {
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
            },
          },
        },
      ],
    }

    const report = await validateDataset(source)

    expect(report.valid).toBe(false)
    expect(report.errors).toHaveLength(1)
    expect(report.errors).toContainEqual({
      type: "cell/type",
      columnName: "id",
      columnType: "integer",
      rowNumber: 2,
      resourceName: "test_resource",
      cell: "not-a-number",
    })
  })

  it("should detect errors in multiple resources", async () => {
    const source: Dataset = {
      resources: [
        {
          name: "resource_1",
          data: [{ id: "invalid", name: "Alice" }],
          tableSchema: {
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
            },
          },
        },
        {
          name: "resource_2",
          data: [{ id: 2, value: "invalid" }],
          tableSchema: {
            properties: {
              id: { type: "integer" },
              value: { type: "integer" },
            },
          },
        },
      ],
    }

    const report = await validateDataset(source)

    expect(report.valid).toBe(false)
    expect(report.errors).toHaveLength(2)
  })
})
