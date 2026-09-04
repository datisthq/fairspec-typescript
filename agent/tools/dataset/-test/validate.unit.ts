import type { Dataset } from "@fairspec/library"
import { writeTempFile } from "@fairspec/library"
import { describe, expect, it } from "vite-plus/test"
import { validateDatasetTool } from "./validate.ts"

describe("validateDatasetTool", () => {
  it("validates tool structure", () => {
    expect(validateDatasetTool.id).toBe("validate-dataset")
    expect(validateDatasetTool.description).toBeTruthy()
    expect(validateDatasetTool.inputSchema).toBeTruthy()
    expect(validateDatasetTool.outputSchema).toBeTruthy()
    expect(validateDatasetTool.execute).toBeTypeOf("function")
  })

  it("validates a valid dataset with inline data", async () => {
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

    const result = await validateDatasetTool.execute?.(
      {
        source,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.report.valid).toBe(true)
    expect(result.report.errors).toHaveLength(0)
  })

  it("detects invalid resource data", async () => {
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

    const result = await validateDatasetTool.execute?.(
      {
        source,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.report.valid).toBe(false)
    expect(result.report.errors).toHaveLength(1)
    expect(result.report.errors).toContainEqual({
      type: "cell/type",
      columnName: "id",
      columnType: "integer",
      rowNumber: 2,
      resourceName: "test_resource",
      cell: "not-a-number",
    })
  })

  it("detects errors in multiple resources", async () => {
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

    const result = await validateDatasetTool.execute?.(
      {
        source,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.report.valid).toBe(false)
    expect(result.report.errors).toHaveLength(2)
  })

  it("validates dataset from file path", async () => {
    const dataset = {
      resources: [
        {
          name: "test",
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
    const path = await writeTempFile(JSON.stringify(dataset), {
      format: "json",
    })

    const result = await validateDatasetTool.execute?.(
      {
        source: path,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.report.valid).toBe(true)
    expect(result.report.errors).toHaveLength(0)
  })

  it("validates empty dataset", async () => {
    const source: Dataset = {
      resources: [],
    }

    const result = await validateDatasetTool.execute?.(
      {
        source,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.report.valid).toBe(true)
    expect(result.report.errors).toHaveLength(0)
  })

  it("validates dataset with multiple valid resources", async () => {
    const source: Dataset = {
      resources: [
        {
          name: "users",
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
        {
          name: "scores",
          data: [
            { user_id: 1, score: 95 },
            { user_id: 2, score: 87 },
          ],
          tableSchema: {
            properties: {
              user_id: { type: "integer" },
              score: { type: "integer" },
            },
          },
        },
      ],
    }

    const result = await validateDatasetTool.execute?.(
      {
        source,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.report.valid).toBe(true)
    expect(result.report.errors).toHaveLength(0)
  })

  it("detects schema mismatch in resource", async () => {
    const source: Dataset = {
      resources: [
        {
          name: "test",
          data: [
            { id: 1, name: "Alice", extra: "field" },
            { id: 2, name: "Bob", extra: "field" },
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

    const result = await validateDatasetTool.execute?.(
      {
        source,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.report.valid).toBe(true)
    expect(result.report.errors).toHaveLength(0)
  })
})
