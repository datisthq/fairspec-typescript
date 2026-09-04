import type { Dataset } from "@fairspec/metadata"
import { beforeEach, describe, expect, it } from "vite-plus/test"
import { getTempFilePath, writeTempFile } from "../../../../../actions/file/temp.ts"
import { loadDatasetFromFolder } from "../load.ts"
import { saveDatasetToFolder } from "../save.ts"

describe("loadDatasetFromFolder", () => {
  let tempFolderPath: string

  beforeEach(() => {
    tempFolderPath = getTempFilePath()
  })

  it("should load a basic dataset from folder", async () => {
    const originalDataset: Dataset = {
      resources: [{ data: { key: "value" } }],
    }

    await saveDatasetToFolder(originalDataset, { folderPath: tempFolderPath })
    const loadedDataset = await loadDatasetFromFolder(tempFolderPath)

    expect(loadedDataset).toBeDefined()
    expect(loadedDataset.resources).toHaveLength(1)
  })

  it("should load dataset with metadata", async () => {
    const originalDataset: Dataset = {
      titles: [{ title: "Test Dataset" }],
      descriptions: [{ description: "A test dataset", descriptionType: "Abstract" }],
      version: "1.0.0",
      resources: [{ data: { key: "value" } }],
    }

    await saveDatasetToFolder(originalDataset, { folderPath: tempFolderPath })
    const loadedDataset = await loadDatasetFromFolder(tempFolderPath)

    expect(loadedDataset.titles?.[0]?.title).toBe("Test Dataset")
    expect(loadedDataset.descriptions?.[0]?.description).toBe("A test dataset")
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

    await saveDatasetToFolder(originalDataset, { folderPath: tempFolderPath })
    const loadedDataset = await loadDatasetFromFolder(tempFolderPath)

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

    await saveDatasetToFolder(originalDataset, { folderPath: tempFolderPath })
    const loadedDataset = await loadDatasetFromFolder(tempFolderPath)

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

    await saveDatasetToFolder(originalDataset, { folderPath: tempFolderPath })
    const loadedDataset = await loadDatasetFromFolder(tempFolderPath)

    expect.assert(loadedDataset.resources)
    expect(loadedDataset.resources[0]?.tableSchema).toBeDefined()
    const schema = loadedDataset.resources[0]?.tableSchema
    expect(typeof schema === "object" && "properties" in schema).toBe(true)
    if (typeof schema === "object" && "properties" in schema) {
      expect(Object.keys(schema.properties ?? {})).toHaveLength(2)
    }
  })

  it("should load dataset with multiple resources", async () => {
    const csvContent = "id,name\n1,alice\n2,bob"
    const csvPath = await writeTempFile(csvContent)

    const originalDataset: Dataset = {
      resources: [
        {
          name: "resource1",
          data: csvPath,
          fileDialect: { format: "csv" },
        },
        {
          name: "resource2",
          data: [{ id: 1, value: 100 }],
        },
      ],
    }

    await saveDatasetToFolder(originalDataset, { folderPath: tempFolderPath })
    const loadedDataset = await loadDatasetFromFolder(tempFolderPath)

    expect(loadedDataset).toBeDefined()
    expect.assert(loadedDataset.resources)
    expect(loadedDataset.resources).toHaveLength(2)
    expect(loadedDataset.resources[0]?.name).toBe("resource1")
    expect(loadedDataset.resources[1]?.name).toBe("resource2")
  })

  it("should load dataset with delimiter", async () => {
    const csvContent = "id;name\n1;alice\n2;bob"
    const csvPath = await writeTempFile(csvContent)

    const originalDataset: Dataset = {
      resources: [
        {
          name: "test_resource",
          data: csvPath,
          fileDialect: { format: "csv", delimiter: ";" },
        },
      ],
    }

    await saveDatasetToFolder(originalDataset, { folderPath: tempFolderPath })
    const loadedDataset = await loadDatasetFromFolder(tempFolderPath)

    expect.assert(loadedDataset.resources)
    expect(loadedDataset.resources[0]?.fileDialect).toBeDefined()
    const dialect = loadedDataset.resources[0]?.fileDialect
    expect(typeof dialect === "object" && "delimiter" in dialect).toBe(true)
    if (typeof dialect === "object" && "delimiter" in dialect) {
      expect(dialect.delimiter).toBe(";")
    }
  })

  it("should throw error for non-existent folder", async () => {
    const nonExistentPath = "/non/existent/folder"

    await expect(loadDatasetFromFolder(nonExistentPath)).rejects.toThrow()
  })

  it("should throw error for folder without dataset.json", async () => {
    const emptyFolderPath = getTempFilePath()
    const fs = await import("node:fs/promises")
    await fs.mkdir(emptyFolderPath, { recursive: true })

    await expect(loadDatasetFromFolder(emptyFolderPath)).rejects.toThrow()
  })
})
