import type { Dataset } from "@fairspec/metadata"
import { beforeEach, describe, expect, it } from "vite-plus/test"
import { getTempFilePath, writeTempFile } from "../../../../../actions/file/temp.ts"
import { loadDatasetFromZip } from "../load.ts"
import { saveDatasetToZip } from "../save.ts"

describe("loadDatasetFromZip", () => {
  let tempZipPath: string

  beforeEach(() => {
    tempZipPath = getTempFilePath()
  })

  it("should load a basic dataset from zip", async () => {
    const originalDataset: Dataset = {
      resources: [
        {
          name: "empty_resource",
          data: { key: "value" },
        },
      ],
    }

    await saveDatasetToZip(originalDataset, { archivePath: tempZipPath })
    const loadedDataset = await loadDatasetFromZip(tempZipPath)

    expect(loadedDataset).toBeDefined()
    expect(loadedDataset.resources).toHaveLength(1)
  })

  it("should load dataset with metadata", async () => {
    const originalDataset: Dataset = {
      titles: [{ title: "Test Dataset" }],
      descriptions: [{ description: "A test data dataset", descriptionType: "Abstract" }],
      version: "1.0.0",
      resources: [
        {
          name: "test_resource",
          data: { key: "value" },
        },
      ],
    }

    await saveDatasetToZip(originalDataset, { archivePath: tempZipPath })
    const loadedDataset = await loadDatasetFromZip(tempZipPath)

    expect(loadedDataset.titles?.[0]?.title).toBe("Test Dataset")
    expect(loadedDataset.descriptions?.[0]?.description).toBe("A test data dataset")
    expect(loadedDataset.version).toBe("1.0.0")
  })

  it("should load dataset with inline data resources", async () => {
    const originalDataset: Dataset = {
      resources: [
        {
          name: "test_resource",
          data: [
            { id: 1, name: "alice" },
            { id: 2, name: "bob" },
          ],
        },
      ],
    }

    await saveDatasetToZip(originalDataset, { archivePath: tempZipPath })
    const loadedDataset = await loadDatasetFromZip(tempZipPath)

    expect(loadedDataset).toBeDefined()
    expect.assert(loadedDataset.resources)
    expect(loadedDataset.resources).toHaveLength(1)
    expect(loadedDataset.resources[0]?.name).toBe("test_resource")
    expect(loadedDataset.resources[0]?.data).toEqual([
      { id: 1, name: "alice" },
      { id: 2, name: "bob" },
    ])
  })

  it("should load dataset with file resources", async () => {
    const csvContent = "id,name\n1,alice\n2,bob"
    const csvPath = await writeTempFile(csvContent)

    const originalDataset: Dataset = {
      resources: [
        {
          name: "test_resource",
          data: csvPath,
          fileDialect: { format: "csv" },
        },
      ],
    }

    await saveDatasetToZip(originalDataset, { archivePath: tempZipPath })
    const loadedDataset = await loadDatasetFromZip(tempZipPath)

    expect(loadedDataset).toBeDefined()
    expect.assert(loadedDataset.resources)
    expect(loadedDataset.resources).toHaveLength(1)
    expect(loadedDataset.resources[0]?.name).toBe("test_resource")
    expect(loadedDataset.resources[0]?.fileDialect).toEqual({ format: "csv" })
  })

  it("should load dataset with tableSchema", async () => {
    const originalDataset: Dataset = {
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
    }

    await saveDatasetToZip(originalDataset, { archivePath: tempZipPath })
    const loadedDataset = await loadDatasetFromZip(tempZipPath)

    expect.assert(loadedDataset.resources)
    expect(loadedDataset.resources[0]?.tableSchema).toBeDefined()
    const tableSchema = loadedDataset.resources[0]?.tableSchema
    expect(typeof tableSchema === "object" && "properties" in tableSchema).toBe(true)
    if (typeof tableSchema === "object" && "properties" in tableSchema) {
      expect(Object.keys(tableSchema.properties ?? {})).toHaveLength(2)
    }
  })

  it("should load dataset with multiple resources", async () => {
    const csvContent = "id,name\n1,alice\n2,bob"
    const csvPath = await writeTempFile(csvContent)

    const originalDataset: Dataset = {
      resources: [
        {
          name: "resource_1",
          data: csvPath,
          fileDialect: { format: "csv" },
        },
        {
          name: "resource_2",
          data: [{ id: 1, value: 100 }],
        },
      ],
    }

    await saveDatasetToZip(originalDataset, { archivePath: tempZipPath })
    const loadedDataset = await loadDatasetFromZip(tempZipPath)

    expect(loadedDataset).toBeDefined()
    expect.assert(loadedDataset.resources)
    expect(loadedDataset.resources).toHaveLength(2)
    expect(loadedDataset.resources[0]?.name).toBe("resource_1")
    expect(loadedDataset.resources[1]?.name).toBe("resource_2")
  })

  it("should throw error for non-existent zip file", async () => {
    const nonExistentPath = "/non/existent/path.zip"

    await expect(loadDatasetFromZip(nonExistentPath)).rejects.toThrow()
  })

  it("should throw error for invalid zip file", async () => {
    const invalidZipPath = await writeTempFile("not a zip file")

    await expect(loadDatasetFromZip(invalidZipPath)).rejects.toThrow()
  })
})
