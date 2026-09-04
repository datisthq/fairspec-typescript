import { join, relative } from "node:path"
import { describe, expect, expectTypeOf, it } from "vite-plus/test"
import type { Dataset } from "../../../models/dataset.ts"
import { loadDatasetDescriptor } from "../load.ts"

describe("loadDatasetDescriptor", async () => {
  const getFixturePath = (name: string) =>
    relative(process.cwd(), join(import.meta.dirname, "fixtures", name))

  it("loads a dataset from a local file path", async () => {
    const dataset = await loadDatasetDescriptor(getFixturePath("dataset.json"))

    expectTypeOf(dataset).toEqualTypeOf<Dataset>()
    expect(dataset.$schema).toMatch(/dataset\.json$/)
    expect(dataset.creators).toBeDefined()
    expect(dataset.creators?.length).toBeGreaterThan(0)
    expect(dataset.resources).toBeDefined()
    expect(dataset.resources?.length).toBeGreaterThan(0)

    const resource = dataset.resources?.[0]
    expect(resource).toBeDefined()

    if (resource) {
      expect(resource.name).toBe("name")
      expect(resource.data).toBe(getFixturePath("table.csv"))
      expect(resource.fileDialect).toEqual({ format: "csv" })
      expect(resource.tableSchema).toBe(getFixturePath("schema.json"))
    }
  })

  it("throws an error when dataset is invalid", async () => {
    await expect(
      loadDatasetDescriptor(getFixturePath("dataset-invalid.json")),
    ).rejects.toThrow()
  })
})
