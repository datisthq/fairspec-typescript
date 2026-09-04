import { stat } from "node:fs/promises"
import type { Dataset } from "@fairspec/metadata"
import { beforeEach, describe, expect, it, vi } from "vite-plus/test"
import * as loadModule from "../actions/dataset/load.ts"
import * as saveModule from "../actions/dataset/save.ts"
import { FolderPlugin } from "../plugin.ts"

vi.mock("../actions/dataset/load.ts", () => ({
  loadDatasetFromFolder: vi.fn(),
}))

vi.mock("../actions/dataset/save.ts", () => ({
  saveDatasetToFolder: vi.fn(),
}))

vi.mock("node:fs/promises", () => ({
  stat: vi.fn(),
}))

describe("FolderPlugin", () => {
  let plugin: FolderPlugin
  let mockLoadDatasetFromFolder: ReturnType<typeof vi.fn>
  let mockSaveDatasetFromFolder: ReturnType<typeof vi.fn>
  let mockStat: ReturnType<typeof vi.fn>

  beforeEach(() => {
    plugin = new FolderPlugin()
    mockLoadDatasetFromFolder = vi.mocked(loadModule.loadDatasetFromFolder)
    mockSaveDatasetFromFolder = vi.mocked(saveModule.saveDatasetToFolder)
    mockStat = vi.mocked(stat)
    vi.clearAllMocks()
  })

  describe("loadDataset", () => {
    it("should load dataset from local directory", async () => {
      const mockDataset: Dataset = {
        resources: [{ name: "test", data: [] }],
      }
      mockStat.mockResolvedValue({ isDirectory: () => true } as any)
      mockLoadDatasetFromFolder.mockResolvedValue(mockDataset)

      const result = await plugin.loadDataset(".")

      expect(mockLoadDatasetFromFolder).toHaveBeenCalledWith(".")
      expect(result).toEqual(mockDataset)
    })

    it("should return undefined for remote paths", async () => {
      const result = await plugin.loadDataset("http://example.com/data")

      expect(mockLoadDatasetFromFolder).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should return undefined for https paths", async () => {
      const result = await plugin.loadDataset("https://example.com/data")

      expect(mockLoadDatasetFromFolder).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should return undefined for github urls", async () => {
      const result = await plugin.loadDataset("https://github.com/owner/repo/data")

      expect(mockLoadDatasetFromFolder).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should return undefined for ftp paths", async () => {
      const result = await plugin.loadDataset("ftp://example.com/data")

      expect(mockLoadDatasetFromFolder).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should return undefined for zenodo urls", async () => {
      const result = await plugin.loadDataset("https://zenodo.org/record/123")

      expect(mockLoadDatasetFromFolder).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })

  describe("saveDataset", () => {
    it("should save dataset to local directory", async () => {
      const mockDataset: Dataset = {
        resources: [{ name: "test", data: [] }],
      }
      mockStat.mockResolvedValue({ isDirectory: () => true } as any)

      const result = await plugin.saveDataset(mockDataset, {
        target: "/tmp/test",
      })

      expect(mockSaveDatasetFromFolder).toHaveBeenCalledWith(mockDataset, {
        folderPath: "/tmp/test",
        withRemote: undefined,
      })
      expect(result).toEqual({ path: "/tmp/test" })
    })

    it("should save dataset with withRemote option", async () => {
      const mockDataset: Dataset = {
        resources: [{ name: "test", data: [] }],
      }
      mockStat.mockResolvedValue({ isDirectory: () => true } as any)

      const result = await plugin.saveDataset(mockDataset, {
        target: "/tmp/test",
        withRemote: true,
      })

      expect(mockSaveDatasetFromFolder).toHaveBeenCalledWith(mockDataset, {
        folderPath: "/tmp/test",
        withRemote: true,
      })
      expect(result).toEqual({ path: "/tmp/test" })
    })

    it("should save dataset to a non-existent folder target", async () => {
      const mockDataset: Dataset = {
        resources: [{ name: "test", data: [] }],
      }
      mockStat.mockRejectedValue(new Error("ENOENT"))

      const result = await plugin.saveDataset(mockDataset, {
        target: "/tmp/new-folder",
      })

      expect(mockSaveDatasetFromFolder).toHaveBeenCalledWith(mockDataset, {
        folderPath: "/tmp/new-folder",
        withRemote: undefined,
      })
      expect(result).toEqual({ path: "/tmp/new-folder" })
    })

    it("should return undefined for a non-existent target with a file extension", async () => {
      const mockDataset: Dataset = {
        resources: [{ name: "test", data: [] }],
      }
      mockStat.mockRejectedValue(new Error("ENOENT"))

      const result = await plugin.saveDataset(mockDataset, {
        target: "/tmp/archive.zip",
      })

      expect(mockSaveDatasetFromFolder).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should return undefined for remote paths", async () => {
      const mockDataset: Dataset = {
        resources: [{ name: "test", data: [] }],
      }

      const result = await plugin.saveDataset(mockDataset, {
        target: "http://example.com/data",
      })

      expect(mockSaveDatasetFromFolder).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should return undefined for https paths", async () => {
      const mockDataset: Dataset = {
        resources: [{ name: "test", data: [] }],
      }

      const result = await plugin.saveDataset(mockDataset, {
        target: "https://example.com/data",
      })

      expect(mockSaveDatasetFromFolder).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })
})
