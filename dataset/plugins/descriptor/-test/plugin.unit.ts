import type { Dataset } from "@fairspec/metadata"
import * as metadataModule from "@fairspec/metadata"
import { beforeEach, describe, expect, it, vi } from "vite-plus/test"
import { DescriptorPlugin } from "../plugin.ts"

vi.mock("@fairspec/metadata", async () => {
  const actual = await vi.importActual("@fairspec/metadata")
  return {
    ...actual,
    loadDatasetDescriptor: vi.fn(),
    saveDatasetDescriptor: vi.fn(),
  }
})

describe("DescriptorPlugin", () => {
  let plugin: DescriptorPlugin
  let mockLoadDatasetDescriptor: ReturnType<typeof vi.fn>
  let mockSaveDatasetDescriptor: ReturnType<typeof vi.fn>

  beforeEach(() => {
    plugin = new DescriptorPlugin()
    mockLoadDatasetDescriptor = vi.mocked(metadataModule.loadDatasetDescriptor)
    mockSaveDatasetDescriptor = vi.mocked(metadataModule.saveDatasetDescriptor)
    vi.clearAllMocks()
  })

  describe("loadDataset", () => {
    it("should load dataset from local datapackage.json file", async () => {
      const mockDataset: Dataset = {
        resources: [{ name: "test", data: [] }],
      }
      mockLoadDatasetDescriptor.mockResolvedValue(mockDataset)

      const result = await plugin.loadDataset("./datapackage.json")

      expect(mockLoadDatasetDescriptor).toHaveBeenCalledWith("./datapackage.json")
      expect(result).toEqual(mockDataset)
    })

    it("should load dataset from local json file", async () => {
      const mockDataset: Dataset = {
        resources: [{ name: "test", data: [] }],
      }
      mockLoadDatasetDescriptor.mockResolvedValue(mockDataset)

      const result = await plugin.loadDataset("./dataset.json")

      expect(mockLoadDatasetDescriptor).toHaveBeenCalledWith("./dataset.json")
      expect(result).toEqual(mockDataset)
    })

    it("should return undefined for remote json urls", async () => {
      const result = await plugin.saveDataset(
        { resources: [] },
        { target: "https://example.com/datapackage.json" },
      )

      expect(mockLoadDatasetDescriptor).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should return undefined for local csv files", async () => {
      const result = await plugin.loadDataset("./data.csv")

      expect(mockLoadDatasetDescriptor).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should return undefined for local xlsx files", async () => {
      const result = await plugin.loadDataset("./data.xlsx")

      expect(mockLoadDatasetDescriptor).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should return undefined for local parquet files", async () => {
      const result = await plugin.loadDataset("./data.parquet")

      expect(mockLoadDatasetDescriptor).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should handle absolute paths", async () => {
      const mockDataset: Dataset = {
        resources: [{ name: "test", data: [] }],
      }
      mockLoadDatasetDescriptor.mockResolvedValue(mockDataset)

      const result = await plugin.loadDataset("/absolute/path/datapackage.json")

      expect(mockLoadDatasetDescriptor).toHaveBeenCalledWith(
        "/absolute/path/datapackage.json",
      )
      expect(result).toEqual(mockDataset)
    })

    it("should return undefined for zenodo urls", async () => {
      const result = await plugin.loadDataset("https://zenodo.org/record/123")

      expect(mockLoadDatasetDescriptor).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })

  describe("saveDataset", () => {
    const mockDataset: Dataset = {
      resources: [{ name: "test", data: [] }],
    }

    it("should save dataset to local datapackage.json file", async () => {
      mockSaveDatasetDescriptor.mockResolvedValue(undefined)

      const result = await plugin.saveDataset(mockDataset, {
        target: "./datapackage.json",
      })

      expect(mockSaveDatasetDescriptor).toHaveBeenCalledWith(mockDataset, {
        path: "./datapackage.json",
      })
      expect(result).toEqual({ path: "./datapackage.json" })
    })

    it("should save dataset with absolute path", async () => {
      mockSaveDatasetDescriptor.mockResolvedValue(undefined)

      const result = await plugin.saveDataset(mockDataset, {
        target: "/absolute/path/datapackage.json",
      })

      expect(mockSaveDatasetDescriptor).toHaveBeenCalledWith(mockDataset, {
        path: "/absolute/path/datapackage.json",
      })
      expect(result).toEqual({ path: "/absolute/path/datapackage.json" })
    })

    it("should return undefined for remote urls", async () => {
      const result = await plugin.saveDataset(mockDataset, {
        target: "https://example.com/datapackage.json",
      })

      expect(mockSaveDatasetDescriptor).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should return undefined for local json files not named datapackage.json", async () => {
      const result = await plugin.saveDataset(mockDataset, {
        target: "./dataset.json",
      })

      expect(mockSaveDatasetDescriptor).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should return undefined for local csv files", async () => {
      const result = await plugin.saveDataset(mockDataset, {
        target: "./data.csv",
      })

      expect(mockSaveDatasetDescriptor).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should return undefined for local xlsx files", async () => {
      const result = await plugin.saveDataset(mockDataset, {
        target: "./data.xlsx",
      })

      expect(mockSaveDatasetDescriptor).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should return undefined for http urls", async () => {
      const result = await plugin.saveDataset(mockDataset, {
        target: "http://example.com/datapackage.json",
      })

      expect(mockSaveDatasetDescriptor).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should ignore withRemote option for local files", async () => {
      mockSaveDatasetDescriptor.mockResolvedValue(undefined)

      const result = await plugin.saveDataset(mockDataset, {
        target: "./datapackage.json",
        withRemote: true,
      })

      expect(mockSaveDatasetDescriptor).toHaveBeenCalledWith(mockDataset, {
        path: "./datapackage.json",
      })
      expect(result).toEqual({ path: "./datapackage.json" })
    })

    it("should return undefined for local directories", async () => {
      const result = await plugin.saveDataset(mockDataset, {
        target: "./data",
      })

      expect(mockSaveDatasetDescriptor).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })
})
