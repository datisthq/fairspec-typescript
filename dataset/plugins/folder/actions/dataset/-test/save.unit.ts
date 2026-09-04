import { access, readFile } from "node:fs/promises"
import { join } from "node:path"
import type { Dataset } from "@fairspec/metadata"
import { beforeEach, describe, expect, it } from "vite-plus/test"
import { getTempFilePath, writeTempFile } from "../../../../../actions/file/temp.ts"
import { loadDatasetFromFolder } from "../load.ts"
import { saveDatasetToFolder } from "../save.ts"

describe("saveDatasetToFolder", () => {
  let tempFolderPath: string

  beforeEach(() => {
    tempFolderPath = getTempFilePath()
  })

  it("should save a basic dataset to folder", async () => {
    const dataset: Dataset = {
      resources: [
        {
          name: "test-resource",
          data: [],
        },
      ],
    }

    await saveDatasetToFolder(dataset, { folderPath: tempFolderPath })

    const descriptorPath = join(tempFolderPath, "dataset.json")
    await expect(access(descriptorPath)).resolves.toBeUndefined()
  })

  it("should save dataset with metadata", async () => {
    const dataset: Dataset = {
      titles: [{ title: "Test Dataset" }],
      descriptions: [{ description: "A test dataset", descriptionType: "Abstract" }],
      version: "1.0.0",
      resources: [
        {
          name: "test-resource",
          data: [],
        },
      ],
    }

    await saveDatasetToFolder(dataset, { folderPath: tempFolderPath })

    const descriptorPath = join(tempFolderPath, "dataset.json")
    await expect(access(descriptorPath)).resolves.toBeUndefined()
  })

  it("should save dataset with inline data resources", async () => {
    const dataset: Dataset = {
      resources: [
        {
          name: "test-resource",
          data: [
            { id: 1, name: "alice" },
            { id: 2, name: "bob" },
          ],
        },
      ],
    }

    await saveDatasetToFolder(dataset, { folderPath: tempFolderPath })

    const descriptorPath = join(tempFolderPath, "dataset.json")
    await expect(access(descriptorPath)).resolves.toBeUndefined()
  })

  it("should save dataset with file resources", async () => {
    const csvContent = "id,name\n1,alice\n2,bob"
    const csvPath = await writeTempFile(csvContent)

    const dataset: Dataset = {
      resources: [
        {
          name: "test-resource",
          data: csvPath,
          fileDialect: { format: "csv" },
        },
      ],
    }

    await saveDatasetToFolder(dataset, { folderPath: tempFolderPath })

    const descriptorPath = join(tempFolderPath, "dataset.json")
    await expect(access(descriptorPath)).resolves.toBeUndefined()
  })

  it("should save dataset with multiple resources", async () => {
    const csvContent = "id,name\n1,alice\n2,bob"
    const csvPath = await writeTempFile(csvContent)

    const dataset: Dataset = {
      resources: [
        {
          name: "resource-1",
          data: csvPath,
          fileDialect: { format: "csv" },
        },
        {
          name: "resource-2",
          data: [{ id: 1, value: 100 }],
        },
      ],
    }

    await saveDatasetToFolder(dataset, { folderPath: tempFolderPath })

    const descriptorPath = join(tempFolderPath, "dataset.json")
    await expect(access(descriptorPath)).resolves.toBeUndefined()
  })

  it("should save dataset with tableSchema", async () => {
    const dataset: Dataset = {
      resources: [
        {
          name: "test-resource",
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

    await saveDatasetToFolder(dataset, { folderPath: tempFolderPath })

    const descriptorPath = join(tempFolderPath, "dataset.json")
    await expect(access(descriptorPath)).resolves.toBeUndefined()
  })

  it("should save dataset with delimiter", async () => {
    const csvContent = "id;name\n1;alice\n2;bob"
    const csvPath = await writeTempFile(csvContent)

    const dataset: Dataset = {
      resources: [
        {
          name: "test-resource",
          data: csvPath,
          fileDialect: { format: "csv", delimiter: ";" },
        },
      ],
    }

    await saveDatasetToFolder(dataset, { folderPath: tempFolderPath })

    const descriptorPath = join(tempFolderPath, "dataset.json")
    await expect(access(descriptorPath)).resolves.toBeUndefined()
  })

  it("should save and reload dataset with same structure", async () => {
    const originalDataset: Dataset = {
      titles: [{ title: "Test Dataset" }],
      descriptions: [{ description: "A test dataset", descriptionType: "Abstract" }],
      resources: [
        {
          name: "test_resource",
          data: [{ id: 1, name: "alice" }],
        },
      ],
    }

    await saveDatasetToFolder(originalDataset, { folderPath: tempFolderPath })
    const reloadedDataset = await loadDatasetFromFolder(tempFolderPath)

    expect(reloadedDataset).toBeDefined()
    expect(reloadedDataset.titles?.[0]?.title).toBe("Test Dataset")
    expect(reloadedDataset.descriptions?.[0]?.description).toBe("A test dataset")
    expect(reloadedDataset.resources).toHaveLength(1)
    expect(reloadedDataset.resources?.[0]?.name).toBe("test_resource")
  })

  it("should save and reload dataset preserving metadata", async () => {
    const originalDataset: Dataset = {
      titles: [{ title: "Test Dataset" }],
      descriptions: [{ description: "A test dataset", descriptionType: "Abstract" }],
      version: "1.0.0",
      resources: [
        {
          name: "test_resource",
          data: [{ id: 1 }],
        },
      ],
    }

    await saveDatasetToFolder(originalDataset, { folderPath: tempFolderPath })
    const reloadedDataset = await loadDatasetFromFolder(tempFolderPath)

    expect(reloadedDataset.titles?.[0]?.title).toBe("Test Dataset")
    expect(reloadedDataset.version).toBe("1.0.0")
  })

  it("should save and reload dataset with tableSchema", async () => {
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
    const reloadedDataset = await loadDatasetFromFolder(tempFolderPath)

    const schema = reloadedDataset.resources?.[0]?.tableSchema
    expect(schema).toBeDefined()
    expect(typeof schema === "object" && "properties" in schema).toBe(true)
    if (typeof schema === "object" && "properties" in schema) {
      expect(Object.keys(schema.properties ?? {})).toHaveLength(2)
      expect(schema.properties?.id).toBeDefined()
      expect(schema.properties?.name).toBeDefined()
    }
  })

  it("should save and reload dataset with file resources", async () => {
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
    const reloadedDataset = await loadDatasetFromFolder(tempFolderPath)

    expect(reloadedDataset.resources).toHaveLength(1)
    expect(reloadedDataset.resources?.[0]?.name).toBe("test_resource")
    expect(reloadedDataset.resources?.[0]?.fileDialect).toEqual({
      format: "csv",
    })
  })

  it("should throw error when saving to existing folder", async () => {
    const dataset: Dataset = {
      resources: [
        {
          name: "test_resource",
          data: [],
        },
      ],
    }

    const fs = await import("node:fs/promises")
    await fs.mkdir(tempFolderPath, { recursive: true })
    await fs.writeFile(join(tempFolderPath, "existing.txt"), "content")

    await expect(
      saveDatasetToFolder(dataset, { folderPath: tempFolderPath }),
    ).rejects.toThrow()
  })

  it("should create valid folder structure", async () => {
    const dataset: Dataset = {
      resources: [
        {
          name: "test_resource",
          data: [{ id: 1 }],
        },
      ],
    }

    await saveDatasetToFolder(dataset, { folderPath: tempFolderPath })
    const reloadedDataset = await loadDatasetFromFolder(tempFolderPath)

    expect(reloadedDataset.resources).toHaveLength(1)
    expect(reloadedDataset.resources?.[0]?.name).toBe("test_resource")
  })

  it("should save dataset with multiple file resources", async () => {
    const csv1Content = "id,name\n1,alice"
    const csv2Content = "id,value\n1,100"
    const csv1Path = await writeTempFile(csv1Content)
    const csv2Path = await writeTempFile(csv2Content)

    const originalDataset: Dataset = {
      resources: [
        {
          name: "resource1",
          data: csv1Path,
          fileDialect: { format: "csv" },
        },
        {
          name: "resource2",
          data: csv2Path,
          fileDialect: { format: "csv" },
        },
      ],
    }

    await saveDatasetToFolder(originalDataset, { folderPath: tempFolderPath })
    const reloadedDataset = await loadDatasetFromFolder(tempFolderPath)

    expect(reloadedDataset.resources).toHaveLength(2)
    expect(reloadedDataset.resources?.[0]?.name).toBe("resource1")
    expect(reloadedDataset.resources?.[1]?.name).toBe("resource2")
  })

  it("should create dataset.json in folder", async () => {
    const dataset: Dataset = {
      resources: [
        {
          name: "test_resource",
          data: [{ id: 1 }],
        },
      ],
    }

    await saveDatasetToFolder(dataset, { folderPath: tempFolderPath })

    const descriptorPath = join(tempFolderPath, "dataset.json")
    const descriptorContent = await readFile(descriptorPath, "utf-8")
    const descriptor = JSON.parse(descriptorContent)

    expect(descriptor.resources).toHaveLength(1)
  })

  it("should copy file resources to folder", async () => {
    const csvContent = "id,name\n1,alice\n2,bob"
    const csvPath = await writeTempFile(csvContent)

    const dataset: Dataset = {
      resources: [
        {
          name: "test_resource",
          data: csvPath,
          fileDialect: { format: "csv" },
        },
      ],
    }

    await saveDatasetToFolder(dataset, { folderPath: tempFolderPath })

    const descriptorPath = join(tempFolderPath, "dataset.json")
    const descriptorContent = await readFile(descriptorPath, "utf-8")
    const descriptor = JSON.parse(descriptorContent)

    const resourceData = descriptor.resources[0].data
    const resourceFilePath = join(tempFolderPath, resourceData)
    const resourceContent = await readFile(resourceFilePath, "utf-8")

    expect(resourceContent).toBe(csvContent)
  })
})
