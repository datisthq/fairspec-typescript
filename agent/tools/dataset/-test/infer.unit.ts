import type { Dataset } from "@fairspec/library"
import { writeTempFile } from "@fairspec/library"
import { describe, expect, it } from "vite-plus/test"
import { inferDatasetTool } from "./infer.ts"

describe("inferDatasetTool", () => {
  it("validates tool structure", () => {
    expect(inferDatasetTool.id).toBe("infer-dataset")
    expect(inferDatasetTool.description).toBeTruthy()
    expect(inferDatasetTool.inputSchema).toBeTruthy()
    expect(inferDatasetTool.outputSchema).toBeTruthy()
    expect(inferDatasetTool.execute).toBeTypeOf("function")
  })

  it("infers dataset with single resource", async () => {
    const path = await writeTempFile("id,name\n1,alice\n2,bob")
    const source: Dataset = {
      language: "en",
      resources: [{ data: path, fileDialect: { format: "csv" } }],
    }

    const result = await inferDatasetTool.execute?.(
      {
        dataset: source,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.dataset.language).toBe("en")
    expect(result.dataset.resources).toHaveLength(1)
    expect(result.dataset.resources?.[0]?.tableSchema).toEqual({
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
      },
    })
  })

  it("infers dataset with multiple resources", async () => {
    const path1 = await writeTempFile("id,name\n1,alice\n2,bob")
    const path2 = await writeTempFile("id,value\n1,100\n2,200")
    const source: Dataset = {
      language: "en",
      resources: [
        { data: path1, fileDialect: { format: "csv" } },
        { data: path2, fileDialect: { format: "csv" } },
      ],
    }

    const result = await inferDatasetTool.execute?.(
      {
        dataset: source,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.dataset.language).toBe("en")
    expect(result.dataset.resources).toHaveLength(2)
    expect(result.dataset.resources?.[0]?.tableSchema).toBeDefined()
    expect(result.dataset.resources?.[1]?.tableSchema).toBeDefined()
  })

  it("infers dataset with inline data resources", async () => {
    const source: Dataset = {
      language: "en",
      resources: [
        {
          data: [
            { id: 1, name: "alice" },
            { id: 2, name: "bob" },
          ],
        },
      ],
    }

    const result = await inferDatasetTool.execute?.(
      {
        dataset: source,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.dataset.language).toBe("en")
    expect(result.dataset.resources).toHaveLength(1)
    expect(result.dataset.resources?.[0]?.tableSchema).toEqual({
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
      },
    })
  })

  it("preserves existing resource properties", async () => {
    const path = await writeTempFile("id,name\n1,alice\n2,bob")
    const source: Dataset = {
      language: "en",
      resources: [
        {
          data: path,
          fileDialect: { format: "csv" },
          tableSchema: {
            properties: {
              id: { type: "string" },
              name: { type: "string" },
            },
          },
        },
      ],
    }

    const result = await inferDatasetTool.execute?.(
      {
        dataset: source,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.dataset.resources?.[0]?.tableSchema).toEqual({
      properties: {
        id: { type: "string" },
        name: { type: "string" },
      },
    })
  })

  it("infers dataset with empty resources", async () => {
    const source: Dataset = {
      resources: [],
    }

    const result = await inferDatasetTool.execute?.(
      {
        dataset: source,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.dataset.resources).toHaveLength(0)
  })

  it("infers resource names when not provided", async () => {
    const path1 = await writeTempFile("id,name\n1,alice")
    const path2 = await writeTempFile("id,value\n1,100")
    const source: Dataset = {
      resources: [
        { data: path1, fileDialect: { format: "csv" } },
        { data: path2, fileDialect: { format: "csv" } },
      ],
    }

    const result = await inferDatasetTool.execute?.(
      {
        dataset: source,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.dataset.resources?.[0]?.name).toBeDefined()
    expect(result.dataset.resources?.[1]?.name).toBeDefined()
  })

  it("infers schemas for different data types", async () => {
    const source: Dataset = {
      resources: [
        {
          data: [
            { id: 1, name: "alice", active: true },
            { id: 2, name: "bob", active: false },
          ],
        },
      ],
    }

    const result = await inferDatasetTool.execute?.(
      {
        dataset: source,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    const tableSchema = result.dataset.resources?.[0]?.tableSchema
    expect(tableSchema).toBeDefined()
    expect(typeof tableSchema).not.toBe("string")
    if (typeof tableSchema === "object" && tableSchema !== null) {
      expect(tableSchema.properties).toMatchObject({
        id: { type: "integer" },
        name: { type: "string" },
        active: { type: "boolean" },
      })
    }
  })

  it("preserves dataset metadata", async () => {
    const source: Dataset = {
      language: "en",
      version: "1.0.0",
      resources: [
        {
          data: [{ id: 1, name: "alice" }],
        },
      ],
    }

    const result = await inferDatasetTool.execute?.(
      {
        dataset: source,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.dataset.language).toBe("en")
    expect(result.dataset.version).toBe("1.0.0")
  })
})
