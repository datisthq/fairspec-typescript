import { writeTempFile } from "@fairspec/dataset"
import { describe, expect, it } from "vite-plus/test"
import { loadDataset } from "../load.ts"

describe("loadDataset", () => {
  it("should load dataset from JSON file", async () => {
    const content = JSON.stringify({
      language: "en",
      resources: [
        {
          name: "test_resource",
          data: [{ id: 1, name: "alice" }],
        },
      ],
    })

    const path = await writeTempFile(content, {
      filename: "datapackage.json",
    })

    const target = await loadDataset(path)

    expect(target).toBeDefined()
    expect(target.language).toBe("en")
    expect(target.resources).toHaveLength(1)
  })

  it("should load dataset with tableSchema", async () => {
    const content = JSON.stringify({
      resources: [
        {
          name: "test_resource",
          data: [{ id: 1, name: "alice" }],
          tableSchema: {
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
            },
          },
        },
      ],
    })

    const path = await writeTempFile(content, {
      filename: "datapackage.json",
    })

    const target = await loadDataset(path)

    expect(target.resources?.[0]?.tableSchema).toEqual({
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
      },
    })
  })

  it("should load dataset with multiple resources", async () => {
    const content = JSON.stringify({
      resources: [
        {
          name: "resource_1",
          data: [{ id: 1, name: "alice" }],
        },
        {
          name: "resource_2",
          data: [{ id: 2, value: 100 }],
        },
      ],
    })

    const path = await writeTempFile(content, {
      filename: "datapackage.json",
    })

    const target = await loadDataset(path)

    expect(target.resources).toHaveLength(2)
  })
})
