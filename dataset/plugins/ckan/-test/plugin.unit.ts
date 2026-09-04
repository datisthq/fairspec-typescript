import type { Dataset } from "@fairspec/metadata"
import { beforeEach, describe, expect, it, vi } from "vite-plus/test"
import * as datasetModule from "../actions/dataset/load.ts"
import { CkanPlugin } from "../plugin.ts"

vi.mock("../actions/dataset/load.ts", () => ({
  loadDatasetFromCkan: vi.fn(),
}))

describe("CkanPlugin", () => {
  let plugin: CkanPlugin
  let mockLoadDatasetFromCkan: ReturnType<typeof vi.fn>

  beforeEach(() => {
    plugin = new CkanPlugin()
    mockLoadDatasetFromCkan = vi.mocked(datasetModule.loadDatasetFromCkan)
    vi.clearAllMocks()
  })

  describe("loadDataset", () => {
    it("should load dataset from ckan url with /dataset/ path", async () => {
      const mockDataset: Dataset = {
        resources: [{ name: "test", data: "https://example.com/data.csv" }],
      }
      mockLoadDatasetFromCkan.mockResolvedValue(mockDataset)

      const result = await plugin.loadDataset(
        "https://data.example.com/dataset/test-dataset",
      )

      expect(mockLoadDatasetFromCkan).toHaveBeenCalledWith(
        "https://data.example.com/dataset/test-dataset",
      )
      expect(result).toEqual(mockDataset)
    })

    it("should return undefined for urls without /dataset/", async () => {
      const result = await plugin.loadDataset("https://example.com/data")

      expect(mockLoadDatasetFromCkan).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should return undefined for local paths", async () => {
      const result = await plugin.loadDataset("./data")

      expect(mockLoadDatasetFromCkan).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should return undefined for github urls", async () => {
      const result = await plugin.loadDataset("https://github.com/owner/repo")

      expect(mockLoadDatasetFromCkan).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should handle ckan urls with additional path segments", async () => {
      const mockDataset: Dataset = {
        resources: [{ name: "test", data: "https://example.com/data.csv" }],
      }
      mockLoadDatasetFromCkan.mockResolvedValue(mockDataset)

      const result = await plugin.loadDataset(
        "https://data.example.com/dataset/test-dataset/resource/123",
      )

      expect(mockLoadDatasetFromCkan).toHaveBeenCalledWith(
        "https://data.example.com/dataset/test-dataset/resource/123",
      )
      expect(result).toEqual(mockDataset)
    })

    it("should handle ckan urls with query parameters", async () => {
      const mockDataset: Dataset = {
        resources: [{ name: "test", data: "https://example.com/data.csv" }],
      }
      mockLoadDatasetFromCkan.mockResolvedValue(mockDataset)

      const result = await plugin.loadDataset(
        "https://data.example.com/dataset/test-dataset?id=456",
      )

      expect(mockLoadDatasetFromCkan).toHaveBeenCalledWith(
        "https://data.example.com/dataset/test-dataset?id=456",
      )
      expect(result).toEqual(mockDataset)
    })

    it("should handle http ckan urls", async () => {
      const mockDataset: Dataset = {
        resources: [{ name: "test", data: "https://example.com/data.csv" }],
      }
      mockLoadDatasetFromCkan.mockResolvedValue(mockDataset)

      const result = await plugin.loadDataset(
        "http://data.example.com/dataset/test-dataset",
      )

      expect(mockLoadDatasetFromCkan).toHaveBeenCalledWith(
        "http://data.example.com/dataset/test-dataset",
      )
      expect(result).toEqual(mockDataset)
    })

    it("should return undefined for zenodo urls", async () => {
      const result = await plugin.loadDataset("https://zenodo.org/record/123")

      expect(mockLoadDatasetFromCkan).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should return undefined for urls with dataset in query params only", async () => {
      const result = await plugin.loadDataset("https://example.com/api?name=dataset")

      expect(mockLoadDatasetFromCkan).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })
})
