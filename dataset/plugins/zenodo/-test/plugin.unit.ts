import type { Dataset } from "@fairspec/metadata"
import { beforeEach, describe, expect, it, vi } from "vite-plus/test"
import * as loadModule from "../actions/dataset/load.ts"
import { ZenodoPlugin } from "../plugin.ts"

vi.mock("../actions/dataset/load.ts", () => ({
  loadDatasetFromZenodo: vi.fn(),
}))

describe("ZenodoPlugin", () => {
  let plugin: ZenodoPlugin
  let mockLoadDatasetFromZenodo: ReturnType<typeof vi.fn>

  beforeEach(() => {
    plugin = new ZenodoPlugin()
    mockLoadDatasetFromZenodo = vi.mocked(loadModule.loadDatasetFromZenodo)
    vi.clearAllMocks()
  })

  describe("loadDataset", () => {
    it("should load dataset from zenodo.org url", async () => {
      const mockDataset: Dataset = {
        resources: [{ name: "test", data: "https://example.com/data.csv" }],
      }
      mockLoadDatasetFromZenodo.mockResolvedValue(mockDataset)

      const result = await plugin.loadDataset("https://zenodo.org/record/123")

      expect(mockLoadDatasetFromZenodo).toHaveBeenCalledWith(
        "https://zenodo.org/record/123",
      )
      expect(result).toEqual(mockDataset)
    })

    it("should return undefined for non-zenodo urls", async () => {
      const result = await plugin.loadDataset("https://example.com/data")

      expect(mockLoadDatasetFromZenodo).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should return undefined for local paths", async () => {
      const result = await plugin.loadDataset("./data")

      expect(mockLoadDatasetFromZenodo).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should return undefined for github urls", async () => {
      const result = await plugin.loadDataset("https://github.com/owner/repo")

      expect(mockLoadDatasetFromZenodo).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should handle sandbox.zenodo.org urls", async () => {
      const mockDataset: Dataset = {
        resources: [{ name: "test", data: "https://example.com/data.csv" }],
      }
      mockLoadDatasetFromZenodo.mockResolvedValue(mockDataset)

      const result = await plugin.loadDataset("https://sandbox.zenodo.org/record/456")

      expect(mockLoadDatasetFromZenodo).toHaveBeenCalledWith(
        "https://sandbox.zenodo.org/record/456",
      )
      expect(result).toEqual(mockDataset)
    })

    it("should handle zenodo urls with paths", async () => {
      const mockDataset: Dataset = {
        resources: [{ name: "test", data: "https://example.com/data.csv" }],
      }
      mockLoadDatasetFromZenodo.mockResolvedValue(mockDataset)

      const result = await plugin.loadDataset(
        "https://zenodo.org/record/123/files/data.zip",
      )

      expect(mockLoadDatasetFromZenodo).toHaveBeenCalledWith(
        "https://zenodo.org/record/123/files/data.zip",
      )
      expect(result).toEqual(mockDataset)
    })

    it("should handle zenodo urls with query parameters", async () => {
      const mockDataset: Dataset = {
        resources: [{ name: "test", data: "https://example.com/data.csv" }],
      }
      mockLoadDatasetFromZenodo.mockResolvedValue(mockDataset)

      const result = await plugin.loadDataset("https://zenodo.org/record/123?preview=1")

      expect(mockLoadDatasetFromZenodo).toHaveBeenCalledWith(
        "https://zenodo.org/record/123?preview=1",
      )
      expect(result).toEqual(mockDataset)
    })

    it("should return undefined for http non-zenodo urls", async () => {
      const result = await plugin.loadDataset("http://example.com/data")

      expect(mockLoadDatasetFromZenodo).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })
})
