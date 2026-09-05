import * as fs from "node:fs/promises"
import * as path from "node:path"
import { temporaryDirectory } from "tempy"
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"
import type { Dataset } from "../../../models/dataset.ts"
import * as settings from "../../../settings.ts"
import { saveDatasetDescriptor } from "../save.ts"
import { validateDatasetDescriptor } from "../validate.ts"

describe("saveDatasetDescriptor", () => {
  let testDir: string
  let testPath: string
  let testDataset: Dataset

  beforeEach(() => {
    testDir = temporaryDirectory()
    testPath = path.join(testDir, "dataset.json")
    testDataset = {
      creators: [
        {
          name: "Test Creator",
        },
      ],
      titles: [
        {
          title: "Test Dataset",
        },
      ],
      resources: [
        {
          name: "test-resource",
          data: path.join(testDir, "data.csv"),
        },
      ],
    }
  })

  afterEach(async () => {
    vi.unstubAllGlobals()

    try {
      await fs.rm(testDir, { recursive: true, force: true })
    } catch (error) {
      if (error instanceof Error && !error.message.includes("ENOENT")) {
        console.error(`Failed to clean up test directory: ${testDir}`, error)
      }
    }
  })

  it("should save a dataset descriptor to a file and maintain its structure", async () => {
    await saveDatasetDescriptor(testDataset, { path: testPath })

    const fileExists = await fs
      .stat(testPath)
      .then(() => true)
      .catch(() => false)
    expect(fileExists).toBe(true)

    const content = await fs.readFile(testPath, "utf-8")
    const parsedContent = JSON.parse(content)

    expect(parsedContent.$schema).toMatch(/dataset\.json$/)
    expect(parsedContent.creators).toHaveLength(1)
    expect(parsedContent.creators[0].name).toBe("Test Creator")
    expect(parsedContent.resources).toHaveLength(1)
    expect(parsedContent.resources[0].name).toBe("test-resource")
    expect(parsedContent.resources[0].data).toBe("data.csv")
  })

  it("should preserve $schema property", async () => {
    await saveDatasetDescriptor(testDataset, { path: testPath })

    const content = await fs.readFile(testPath, "utf-8")
    const parsedContent = JSON.parse(content)
    expect(parsedContent.$schema).toBe(
      `https://fairspec.org/profiles/${settings.FAIRSPEC_VERSION}/dataset.json`,
    )
  })

  it("should preserve custom $schema property", async () => {
    const datasetWithCustomSchema: Dataset = {
      ...testDataset,
      $schema: "https://custom.schema.url/dataset.json",
    }

    await saveDatasetDescriptor(datasetWithCustomSchema, { path: testPath })

    const content = await fs.readFile(testPath, "utf-8")
    const parsedContent = JSON.parse(content)
    expect(parsedContent.$schema).toBe("https://custom.schema.url/dataset.json")
  })

  it("should use pretty formatting with 2-space indentation", async () => {
    await saveDatasetDescriptor(testDataset, { path: testPath })

    const content = await fs.readFile(testPath, "utf-8")
    const lines = content.split("\n")
    expect(lines.length).toBeGreaterThan(1)

    if (lines.length > 1 && lines[1]) {
      expect(lines[1].startsWith("  ")).toBe(true)
    }
  })

  it("should save dataset with multiple resources", async () => {
    const datasetWithMultipleResources: Dataset = {
      ...testDataset,
      resources: [
        {
          name: "resource1",
          data: path.join(testDir, "data1.csv"),
        },
        {
          name: "resource2",
          data: path.join(testDir, "data2.json"),
          fileDialect: { format: "json" },
        },
      ],
    }

    await saveDatasetDescriptor(datasetWithMultipleResources, {
      path: testPath,
    })

    const content = await fs.readFile(testPath, "utf-8")
    const parsedContent = JSON.parse(content)
    expect(parsedContent.resources).toHaveLength(2)
    expect(parsedContent.resources[0]?.name).toBe("resource1")
    expect(parsedContent.resources[1]?.name).toBe("resource2")
  })

  it("should save dataset with resource containing tableSchema", async () => {
    const datasetWithSchema: Dataset = {
      ...testDataset,
      resources: [
        {
          name: "test-resource",
          data: path.join(testDir, "data.csv"),
          tableSchema: {
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
            },
          },
        },
      ],
    }

    await saveDatasetDescriptor(datasetWithSchema, { path: testPath })

    const content = await fs.readFile(testPath, "utf-8")
    const parsedContent = JSON.parse(content)
    expect(parsedContent.resources[0]?.tableSchema).toEqual(
      datasetWithSchema.resources?.[0]?.tableSchema,
    )
  })

  it("should save dataset with resource containing format options", async () => {
    const datasetWithFormat: Dataset = {
      ...testDataset,
      resources: [
        {
          name: "test-resource",
          data: path.join(testDir, "data.csv"),
          fileDialect: {
            format: "csv",
            delimiter: ";",
            lineTerminator: "\n",
          },
        },
      ],
    }

    await saveDatasetDescriptor(datasetWithFormat, { path: testPath })

    const content = await fs.readFile(testPath, "utf-8")
    const parsedContent = JSON.parse(content)
    expect(parsedContent.resources[0]?.fileDialect).toEqual(
      datasetWithFormat.resources?.[0]?.fileDialect,
    )
  })

  it("should save dataset to a nested directory path", async () => {
    const nestedPath = path.join(testDir, "nested", "dir", "dataset.json")
    const nestedDataset: Dataset = {
      ...testDataset,
      resources: [
        {
          name: "test-resource",
          data: path.join(testDir, "nested", "dir", "data.csv"),
        },
      ],
    }

    await saveDatasetDescriptor(nestedDataset, { path: nestedPath })

    const fileExists = await fs
      .stat(nestedPath)
      .then(() => true)
      .catch(() => false)
    expect(fileExists).toBe(true)

    const content = await fs.readFile(nestedPath, "utf-8")
    const parsedContent = JSON.parse(content)
    expect(parsedContent.creators[0].name).toBe("Test Creator")
  })

  it("should throw an error when file exists and overwrite is false", async () => {
    await saveDatasetDescriptor(testDataset, { path: testPath })

    await expect(
      saveDatasetDescriptor(testDataset, {
        path: testPath,
        overwrite: false,
      }),
    ).rejects.toThrow()
  })

  it("should throw an error when file exists and overwrite is not specified", async () => {
    await saveDatasetDescriptor(testDataset, { path: testPath })

    await expect(saveDatasetDescriptor(testDataset, { path: testPath })).rejects.toThrow()
  })

  it("should overwrite existing file when overwrite is true", async () => {
    const initialDataset: Dataset = {
      creators: [{ name: "Initial Creator" }],
      titles: [{ title: "Initial Dataset" }],
      resources: [
        {
          name: "resource1",
          data: path.join(testDir, "data1.csv"),
        },
      ],
    }

    const updatedDataset: Dataset = {
      creators: [{ name: "Updated Creator" }],
      titles: [{ title: "Updated Dataset" }],
      resources: [
        {
          name: "resource2",
          data: path.join(testDir, "data2.csv"),
        },
      ],
      descriptions: [
        {
          description: "Updated dataset",
          descriptionType: "Abstract",
        },
      ],
    }

    await saveDatasetDescriptor(initialDataset, { path: testPath })

    const initialContent = await fs.readFile(testPath, "utf-8")
    const initialParsed = JSON.parse(initialContent)
    expect(initialParsed.creators[0].name).toBe("Initial Creator")

    await saveDatasetDescriptor(updatedDataset, {
      path: testPath,
      overwrite: true,
    })

    const updatedContent = await fs.readFile(testPath, "utf-8")
    const updatedParsed = JSON.parse(updatedContent)
    expect(updatedParsed.creators[0].name).toBe("Updated Creator")
    expect(updatedParsed.descriptions[0].description).toBe("Updated dataset")
  })

  it("should save dataset with all DataCite metadata fields", async () => {
    const fullDataset: Dataset = {
      creators: [{ name: "Full Creator" }],
      titles: [{ title: "Full Dataset" }],
      publisher: { name: "Example Publisher" },
      publicationYear: "2024",
      subjects: [{ subject: "test" }, { subject: "data" }, { subject: "dataset" }],
      descriptions: [
        {
          description: "A dataset with all fields",
          descriptionType: "Abstract",
        },
      ],
      version: "1.0.0",
      dates: [
        {
          date: "2024-01-01",
          dateType: "Created",
        },
      ],
      relatedIdentifiers: [
        {
          relatedIdentifier: "https://example.com",
          relatedIdentifierType: "URL",
          relationType: "IsDescribedBy",
        },
      ],
      resources: [
        {
          name: "test-resource",
          data: path.join(testDir, "data.csv"),
        },
      ],
    }

    await saveDatasetDescriptor(fullDataset, { path: testPath })

    const content = await fs.readFile(testPath, "utf-8")
    const parsedContent = JSON.parse(content)
    expect(parsedContent.creators[0].name).toBe("Full Creator")
    expect(parsedContent.titles[0].title).toBe("Full Dataset")
    expect(parsedContent.descriptions[0].description).toBe("A dataset with all fields")
    expect(parsedContent.version).toBe("1.0.0")
    expect(parsedContent.publicationYear).toBe("2024")
    expect(parsedContent.subjects).toHaveLength(3)
    expect(parsedContent.dates[0].date).toBe("2024-01-01")
  })

  it("should save dataset with contributors", async () => {
    const datasetWithContributors: Dataset = {
      ...testDataset,
      contributors: [
        {
          name: "John Doe",
          contributorType: "DataCollector",
        },
        {
          name: "Jane Smith",
          contributorType: "Editor",
        },
      ],
    }

    await saveDatasetDescriptor(datasetWithContributors, { path: testPath })

    const content = await fs.readFile(testPath, "utf-8")
    const parsedContent = JSON.parse(content)
    expect(parsedContent.contributors).toHaveLength(2)
    expect(parsedContent.contributors[0]?.name).toBe("John Doe")
    expect(parsedContent.contributors[0]?.contributorType).toBe("DataCollector")
    expect(parsedContent.contributors[1]?.name).toBe("Jane Smith")
  })

  it("should save dataset with rightsList", async () => {
    const datasetWithRights: Dataset = {
      ...testDataset,
      rightsList: [
        {
          rights: "MIT License",
          rightsUri: "https://opensource.org/licenses/MIT",
        },
      ],
    }

    await saveDatasetDescriptor(datasetWithRights, { path: testPath })

    const content = await fs.readFile(testPath, "utf-8")
    const parsedContent = JSON.parse(content)
    expect(parsedContent.rightsList).toHaveLength(1)
    expect(parsedContent.rightsList[0]?.rights).toBe("MIT License")
  })

  it("should save dataset with relatedIdentifiers", async () => {
    const datasetWithRelated: Dataset = {
      ...testDataset,
      relatedIdentifiers: [
        {
          relatedIdentifier: "https://example.com/data",
          relatedIdentifierType: "URL",
          relationType: "IsSourceOf",
        },
      ],
    }

    await saveDatasetDescriptor(datasetWithRelated, { path: testPath })

    const content = await fs.readFile(testPath, "utf-8")
    const parsedContent = JSON.parse(content)
    expect(parsedContent.relatedIdentifiers).toHaveLength(1)
    expect(parsedContent.relatedIdentifiers[0]?.relatedIdentifier).toBe(
      "https://example.com/data",
    )
  })

  it("should save a dataset that validates offline against the stamped $schema", async () => {
    const datasetWithIntegrity: Dataset = {
      ...testDataset,
      resources: [
        {
          name: "test_resource",
          data: path.join(testDir, "data.csv"),
          integrity: {
            type: "sha256",
            hash: "5f951fd841d3bd6c03ea05024f8c564096e10a3e17483e6a70d25a885942683a",
          },
        },
      ],
    }

    vi.stubGlobal("fetch", async (url: string) => {
      throw new TypeError(`offline: ${url}`)
    })

    await saveDatasetDescriptor(datasetWithIntegrity, { path: testPath })
    const report = await validateDatasetDescriptor(testPath)

    expect(report.errors).toEqual([])
    expect(report.valid).toBe(true)
  })
})
