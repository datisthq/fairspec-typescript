import { readFile } from "node:fs/promises"
import type { Dataset } from "@fairspec/metadata"
import { beforeEach, describe, expect, it } from "vite-plus/test"
import { getTempFilePath, writeTempFile } from "../../../../../actions/file/temp.ts"
import { loadDatasetFromZip } from "../load.ts"
import { saveDatasetToZip } from "../save.ts"

describe("saveDatasetToZip", () => {
  let tempZipPath: string

  beforeEach(() => {
    tempZipPath = getTempFilePath()
  })

  it("should save a basic dataset to zip", async () => {
    const dataset: Dataset = {
      resources: [
        {
          name: "test_resource",
          data: [],
        },
      ],
    }

    await saveDatasetToZip(dataset, { archivePath: tempZipPath })

    const fileBuffer = await readFile(tempZipPath)
    expect(fileBuffer.length).toBeGreaterThan(0)
  })

  it("should save dataset with metadata", async () => {
    const dataset: Dataset = {
      titles: [{ title: "Test Dataset" }],
      descriptions: [{ description: "A test dataset", descriptionType: "Abstract" }],
      version: "1.0.0",
      resources: [
        {
          name: "test_resource",
          data: [],
        },
      ],
    }

    await saveDatasetToZip(dataset, { archivePath: tempZipPath })

    const fileBuffer = await readFile(tempZipPath)
    expect(fileBuffer.length).toBeGreaterThan(0)
  })

  it("should save dataset with inline data resources", async () => {
    const dataset: Dataset = {
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

    await saveDatasetToZip(dataset, { archivePath: tempZipPath })

    const fileBuffer = await readFile(tempZipPath)
    expect(fileBuffer.length).toBeGreaterThan(0)
  })

  it("should save dataset with file resources", async () => {
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

    await saveDatasetToZip(dataset, { archivePath: tempZipPath })

    const fileBuffer = await readFile(tempZipPath)
    expect(fileBuffer.length).toBeGreaterThan(0)
  })

  it("should save dataset with multiple resources", async () => {
    const csvContent = "id,name\n1,alice\n2,bob"
    const csvPath = await writeTempFile(csvContent)

    const dataset: Dataset = {
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

    await saveDatasetToZip(dataset, { archivePath: tempZipPath })

    const fileBuffer = await readFile(tempZipPath)
    expect(fileBuffer.length).toBeGreaterThan(0)
  })

  it("should save dataset with tableSchema", async () => {
    const dataset: Dataset = {
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

    await saveDatasetToZip(dataset, { archivePath: tempZipPath })

    const fileBuffer = await readFile(tempZipPath)
    expect(fileBuffer.length).toBeGreaterThan(0)
  })

  it("should save dataset with dialect", async () => {
    const csvContent = "id;name\n1;alice\n2;bob"
    const csvPath = await writeTempFile(csvContent)

    const dataset: Dataset = {
      resources: [
        {
          name: "test_resource",
          data: csvPath,
          fileDialect: { format: "csv", delimiter: ";" },
        },
      ],
    }

    await saveDatasetToZip(dataset, { archivePath: tempZipPath })

    const fileBuffer = await readFile(tempZipPath)
    expect(fileBuffer.length).toBeGreaterThan(0)
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

    await saveDatasetToZip(originalDataset, { archivePath: tempZipPath })
    const reloadedDataset = await loadDatasetFromZip(tempZipPath)

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
      subjects: [{ subject: "test" }, { subject: "dataset" }],
      resources: [
        {
          name: "test_resource",
          data: [{ id: 1 }],
        },
      ],
    }

    await saveDatasetToZip(originalDataset, { archivePath: tempZipPath })
    const reloadedDataset = await loadDatasetFromZip(tempZipPath)

    expect(reloadedDataset.titles?.[0]?.title).toBe("Test Dataset")
    expect(reloadedDataset.version).toBe("1.0.0")
    expect(reloadedDataset.subjects).toEqual([
      { subject: "test" },
      { subject: "dataset" },
    ])
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

    await saveDatasetToZip(originalDataset, { archivePath: tempZipPath })
    const reloadedDataset = await loadDatasetFromZip(tempZipPath)

    const tableSchema = reloadedDataset.resources?.[0]?.tableSchema
    expect(tableSchema).toBeDefined()
    expect(typeof tableSchema === "object" && "properties" in tableSchema).toBe(true)
    if (typeof tableSchema === "object" && "properties" in tableSchema) {
      const properties = Object.entries(tableSchema.properties ?? {})
      expect(properties).toHaveLength(2)
      expect(properties[0]?.[0]).toBe("id")
      expect(properties[1]?.[0]).toBe("name")
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

    await saveDatasetToZip(originalDataset, { archivePath: tempZipPath })
    const reloadedDataset = await loadDatasetFromZip(tempZipPath)

    expect(reloadedDataset.resources).toHaveLength(1)
    expect(reloadedDataset.resources?.[0]?.name).toBe("test_resource")
    expect(reloadedDataset.resources?.[0]?.fileDialect).toEqual({
      format: "csv",
    })
  })

  it("should throw error when saving to existing file", async () => {
    const dataset: Dataset = {
      resources: [
        {
          name: "test_resource",
          data: [],
        },
      ],
    }

    await writeTempFile("existing content", { persist: true })
    const existingPath = await writeTempFile("existing content")

    await expect(
      saveDatasetToZip(dataset, { archivePath: existingPath }),
    ).rejects.toThrow()
  })

  it("should create valid zip file structure", async () => {
    const dataset: Dataset = {
      resources: [
        {
          name: "test_resource",
          data: [{ id: 1 }],
        },
      ],
    }

    await saveDatasetToZip(dataset, { archivePath: tempZipPath })
    const reloadedDataset = await loadDatasetFromZip(tempZipPath)

    expect(reloadedDataset).toMatchObject({
      resources: [
        {
          name: "test_resource",
        },
      ],
    })
  })

  it("should save dataset with multiple file resources", async () => {
    const csv1Content = "id,name\n1,alice"
    const csv2Content = "id,value\n1,100"
    const csv1Path = await writeTempFile(csv1Content)
    const csv2Path = await writeTempFile(csv2Content)

    const originalDataset: Dataset = {
      resources: [
        {
          name: "resource_1",
          data: csv1Path,
          fileDialect: { format: "csv" },
        },
        {
          name: "resource_2",
          data: csv2Path,
          fileDialect: { format: "csv" },
        },
      ],
    }

    await saveDatasetToZip(originalDataset, { archivePath: tempZipPath })
    const reloadedDataset = await loadDatasetFromZip(tempZipPath)

    expect(reloadedDataset.resources).toHaveLength(2)
    expect(reloadedDataset.resources?.[0]?.name).toBe("resource_1")
    expect(reloadedDataset.resources?.[1]?.name).toBe("resource_2")
  })
})
