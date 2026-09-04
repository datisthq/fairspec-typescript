import { writeTempFile } from "@fairspec/dataset"
import type { Dataset } from "@fairspec/metadata"
import { describe, expect, it } from "vite-plus/test"
import { inferDataset } from "../infer.ts"

describe("inferDataset", () => {
  it("should infer dataset with single resource", async () => {
    const path = await writeTempFile("id,name\n1,alice\n2,bob")
    const source: Dataset = {
      language: "en",
      resources: [{ data: path, fileDialect: { format: "csv" } }],
    }

    const target = await inferDataset(source)

    expect(target.language).toBe("en")
    expect(target.resources).toHaveLength(1)
    expect(target.resources?.[0]?.tableSchema).toEqual({
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
      },
    })
  })

  it("should infer dataset with multiple resources", async () => {
    const path1 = await writeTempFile("id,name\n1,alice\n2,bob")
    const path2 = await writeTempFile("id,value\n1,100\n2,200")
    const source: Dataset = {
      language: "en",
      resources: [
        { data: path1, fileDialect: { format: "csv" } },
        { data: path2, fileDialect: { format: "csv" } },
      ],
    }

    const target = await inferDataset(source)

    expect(target.language).toBe("en")
    expect(target.resources).toHaveLength(2)
    expect(target.resources?.[0]?.tableSchema).toBeDefined()
    expect(target.resources?.[1]?.tableSchema).toBeDefined()
  })

  it("should infer dataset with inline data resources", async () => {
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

    const target = await inferDataset(source)

    expect(target.language).toBe("en")
    expect(target.resources).toHaveLength(1)
    expect(target.resources?.[0]?.tableSchema).toEqual({
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
      },
    })
  })

  it("should preserve existing resource properties", async () => {
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

    const target = await inferDataset(source)

    expect(target.resources?.[0]?.tableSchema).toEqual({
      properties: {
        id: { type: "string" },
        name: { type: "string" },
      },
    })
  })
})
