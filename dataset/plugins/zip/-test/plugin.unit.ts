import type { Dataset } from "@fairspec/metadata"
import { beforeEach, describe, expect, it, vi } from "vite-plus/test"
import * as loadModule from "../actions/dataset/load.ts"
import * as saveModule from "../actions/dataset/save.ts"
import { ZipPlugin } from "../plugin.ts"

vi.mock("../actions/dataset/load.ts", () => ({
  loadDatasetFromZip: vi.fn(),
}))

vi.mock("../actions/dataset/save.ts", () => ({
  saveDatasetToZip: vi.fn(),
}))

describe("ZipPlugin", () => {
  let plugin: ZipPlugin
  let mockLoadDatasetFromZip: ReturnType<typeof vi.fn>
  let mockSaveDatasetToZip: ReturnType<typeof vi.fn>

  beforeEach(() => {
    plugin = new ZipPlugin()
    mockLoadDatasetFromZip = vi.mocked(loadModule.loadDatasetFromZip)
    mockSaveDatasetToZip = vi.mocked(saveModule.saveDatasetToZip)
    vi.clearAllMocks()
  })

  describe("loadDataset", () => {
    it("should load dataset from zip file", async () => {
      const mockDataset: Dataset = {
        resources: [{ name: "test-resource", data: [] }],
      }
      mockLoadDatasetFromZip.mockResolvedValue(mockDataset)

      const result = await plugin.loadDataset("test.zip")

      expect(mockLoadDatasetFromZip).toHaveBeenCalledWith("test.zip")
      expect(result).toEqual(mockDataset)
    })

    it("should return undefined for non-zip files", async () => {
      const result = await plugin.loadDataset("test.json")

      expect(mockLoadDatasetFromZip).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should recognize .zip extension case-insensitively", async () => {
      const mockDataset: Dataset = {
        resources: [],
      }
      mockLoadDatasetFromZip.mockResolvedValue(mockDataset)

      await plugin.loadDataset("test.zip")

      expect(mockLoadDatasetFromZip).toHaveBeenCalledWith("test.zip")
    })

    it("should handle paths with directories", async () => {
      const mockDataset: Dataset = {
        resources: [],
      }
      mockLoadDatasetFromZip.mockResolvedValue(mockDataset)

      const result = await plugin.loadDataset("/path/to/file.zip")

      expect(mockLoadDatasetFromZip).toHaveBeenCalledWith("/path/to/file.zip")
      expect(result).toEqual(mockDataset)
    })

    it("should return undefined for files without extension", async () => {
      const result = await plugin.loadDataset("test")

      expect(mockLoadDatasetFromZip).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })

  describe("saveDataset", () => {
    it("should save dataset to zip file", async () => {
      const dataset: Dataset = {
        resources: [{ name: "test-resource", data: [] }],
      }
      mockSaveDatasetToZip.mockResolvedValue(undefined)

      const result = await plugin.saveDataset(dataset, {
        target: "output.zip",
      })

      expect(mockSaveDatasetToZip).toHaveBeenCalledWith(dataset, {
        archivePath: "output.zip",
        withRemote: false,
      })
      expect(result).toEqual({ path: undefined })
    })

    it("should return undefined for non-zip targets", async () => {
      const dataset: Dataset = {
        resources: [],
      }

      const result = await plugin.saveDataset(dataset, {
        target: "output.json",
      })

      expect(mockSaveDatasetToZip).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should pass withRemote option", async () => {
      const dataset: Dataset = {
        resources: [],
      }
      mockSaveDatasetToZip.mockResolvedValue(undefined)

      await plugin.saveDataset(dataset, {
        target: "output.zip",
        withRemote: true,
      })

      expect(mockSaveDatasetToZip).toHaveBeenCalledWith(dataset, {
        archivePath: "output.zip",
        withRemote: true,
      })
    })

    it("should handle withRemote as false when not provided", async () => {
      const dataset: Dataset = {
        resources: [],
      }
      mockSaveDatasetToZip.mockResolvedValue(undefined)

      await plugin.saveDataset(dataset, {
        target: "output.zip",
      })

      expect(mockSaveDatasetToZip).toHaveBeenCalledWith(dataset, {
        archivePath: "output.zip",
        withRemote: false,
      })
    })

    it("should handle paths with directories", async () => {
      const dataset: Dataset = {
        resources: [],
      }
      mockSaveDatasetToZip.mockResolvedValue(undefined)

      await plugin.saveDataset(dataset, {
        target: "/path/to/output.zip",
      })

      expect(mockSaveDatasetToZip).toHaveBeenCalledWith(dataset, {
        archivePath: "/path/to/output.zip",
        withRemote: false,
      })
    })

    it("should save dataset with metadata", async () => {
      const dataset: Dataset = {
        titles: [{ title: "Test Dataset" }],
        descriptions: [{ description: "A test dataset", descriptionType: "Abstract" }],
        resources: [],
      }
      mockSaveDatasetToZip.mockResolvedValue(undefined)

      await plugin.saveDataset(dataset, {
        target: "output.zip",
      })

      expect(mockSaveDatasetToZip).toHaveBeenCalledWith(dataset, {
        archivePath: "output.zip",
        withRemote: false,
      })
    })

    it("should return undefined for files without extension", async () => {
      const dataset: Dataset = {
        resources: [],
      }

      const result = await plugin.saveDataset(dataset, {
        target: "output",
      })

      expect(mockSaveDatasetToZip).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })
})
