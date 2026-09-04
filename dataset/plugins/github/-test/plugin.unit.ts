import type { Dataset } from "@fairspec/metadata"
import { beforeEach, describe, expect, it, vi } from "vite-plus/test"
import * as loadModule from "../actions/dataset/load.ts"
import { GithubPlugin } from "../plugin.ts"

vi.mock("../actions/dataset/load.ts", () => ({
  loadDatasetFromGithub: vi.fn(),
}))

describe("GithubPlugin", () => {
  let plugin: GithubPlugin
  let mockLoadDatasetFromGithub: ReturnType<typeof vi.fn>

  beforeEach(() => {
    plugin = new GithubPlugin()
    mockLoadDatasetFromGithub = vi.mocked(loadModule.loadDatasetFromGithub)
    vi.clearAllMocks()
  })

  describe("loadDataset", () => {
    it("should load dataset from github.com url", async () => {
      const mockDataset: Dataset = {
        resources: [{ data: [] }],
      }
      mockLoadDatasetFromGithub.mockResolvedValue(mockDataset)

      const result = await plugin.loadDataset("https://github.com/owner/repo/data")

      expect(mockLoadDatasetFromGithub).toHaveBeenCalledWith(
        "https://github.com/owner/repo/data",
      )
      expect(result).toEqual(mockDataset)
    })

    it("should return undefined for non-github urls", async () => {
      const result = await plugin.loadDataset("https://example.com/data")

      expect(mockLoadDatasetFromGithub).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should return undefined for local paths", async () => {
      const result = await plugin.loadDataset("./data")

      expect(mockLoadDatasetFromGithub).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should return undefined for zenodo urls", async () => {
      const result = await plugin.loadDataset("https://zenodo.org/record/123")

      expect(mockLoadDatasetFromGithub).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should handle github urls with paths", async () => {
      const mockDataset: Dataset = {
        resources: [{ data: [] }],
      }
      mockLoadDatasetFromGithub.mockResolvedValue(mockDataset)

      const result = await plugin.loadDataset(
        "https://github.com/owner/repo/tree/main/data",
      )

      expect(mockLoadDatasetFromGithub).toHaveBeenCalledWith(
        "https://github.com/owner/repo/tree/main/data",
      )
      expect(result).toEqual(mockDataset)
    })

    it("should handle github urls with query parameters", async () => {
      const mockDataset: Dataset = {
        resources: [{ data: [] }],
      }
      mockLoadDatasetFromGithub.mockResolvedValue(mockDataset)

      const result = await plugin.loadDataset("https://github.com/owner/repo?tab=readme")

      expect(mockLoadDatasetFromGithub).toHaveBeenCalledWith(
        "https://github.com/owner/repo?tab=readme",
      )
      expect(result).toEqual(mockDataset)
    })

    it("should return undefined for http non-github urls", async () => {
      const result = await plugin.loadDataset("http://example.com/data")

      expect(mockLoadDatasetFromGithub).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should return undefined for gitlab urls", async () => {
      const result = await plugin.loadDataset("https://gitlab.com/owner/repo")

      expect(mockLoadDatasetFromGithub).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })
})
