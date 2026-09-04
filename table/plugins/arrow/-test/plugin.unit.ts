import type { Resource } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { beforeEach, describe, expect, it, vi } from "vite-plus/test"
import * as loadModule from "../actions/table/load.ts"
import * as saveModule from "../actions/table/save.ts"
import { ArrowPlugin } from "../plugin.ts"

vi.mock("../actions/table/load.ts", () => ({
  loadArrowTable: vi.fn(),
}))

vi.mock("../actions/table/save.ts", () => ({
  saveArrowTable: vi.fn(),
}))

describe("ArrowPlugin", () => {
  let plugin: ArrowPlugin
  let mockLoadArrowTable: ReturnType<typeof vi.fn>
  let mockSaveArrowTable: ReturnType<typeof vi.fn>

  beforeEach(() => {
    plugin = new ArrowPlugin()
    mockLoadArrowTable = vi.mocked(loadModule.loadArrowTable)
    mockSaveArrowTable = vi.mocked(saveModule.saveArrowTable)
    vi.clearAllMocks()
  })

  describe("loadTable", () => {
    it("should load table from arrow file", async () => {
      const resource: Resource = {
        data: "test.arrow",
      }
      const mockTable = pl.DataFrame().lazy()
      mockLoadArrowTable.mockResolvedValue(mockTable)

      const result = await plugin.loadTable(resource)

      expect(mockLoadArrowTable).toHaveBeenCalledWith(
        { ...resource, fileDialect: { format: "arrow" } },
        undefined,
      )
      expect(result).toEqual(mockTable)
    })

    it("should load table from feather file", async () => {
      const resource: Resource = {
        data: "test.feather",
      }
      const mockTable = pl.DataFrame().lazy()
      mockLoadArrowTable.mockResolvedValue(mockTable)

      const result = await plugin.loadTable(resource)

      expect(mockLoadArrowTable).toHaveBeenCalledWith(
        { ...resource, fileDialect: { format: "arrow" } },
        undefined,
      )
      expect(result).toEqual(mockTable)
    })

    it("should return undefined for non-arrow files", async () => {
      const resource: Resource = {
        data: "test.csv",
      }

      const result = await plugin.loadTable(resource)

      expect(mockLoadArrowTable).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should handle explicit arrow format specification", async () => {
      const resource: Resource = {
        data: "test.txt",
        fileDialect: { format: "arrow" },
      }
      const mockTable = pl.DataFrame().lazy()
      mockLoadArrowTable.mockResolvedValue(mockTable)

      const result = await plugin.loadTable(resource)

      expect(mockLoadArrowTable).toHaveBeenCalledWith(resource, undefined)
      expect(result).toEqual(mockTable)
    })

    it("should pass through load options", async () => {
      const resource: Resource = {
        data: "test.arrow",
      }
      const options = { denormalized: true }
      const mockTable = pl.DataFrame().lazy()
      mockLoadArrowTable.mockResolvedValue(mockTable)

      await plugin.loadTable(resource, options)

      expect(mockLoadArrowTable).toHaveBeenCalledWith(
        { ...resource, fileDialect: { format: "arrow" } },
        options,
      )
    })

    it("should handle paths with directories", async () => {
      const resource: Resource = {
        data: "/path/to/data.arrow",
      }
      const mockTable = pl.DataFrame().lazy()
      mockLoadArrowTable.mockResolvedValue(mockTable)

      await plugin.loadTable(resource)

      expect(mockLoadArrowTable).toHaveBeenCalledWith(
        { ...resource, fileDialect: { format: "arrow" } },
        undefined,
      )
    })

    it("should return undefined for parquet files", async () => {
      const resource: Resource = {
        data: "test.parquet",
      }

      const result = await plugin.loadTable(resource)

      expect(mockLoadArrowTable).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })

  describe("saveTable", () => {
    it("should save table to arrow file", async () => {
      const table = pl.DataFrame().lazy()
      const options = { path: "output.arrow" }
      mockSaveArrowTable.mockResolvedValue("output.arrow")

      const result = await plugin.saveTable(table, options)

      expect(mockSaveArrowTable).toHaveBeenCalledWith(table, {
        ...options,
        fileDialect: { format: "arrow" },
      })
      expect(result).toBe("output.arrow")
    })

    it("should save table to feather file", async () => {
      const table = pl.DataFrame().lazy()
      const options = { path: "output.feather" }
      mockSaveArrowTable.mockResolvedValue("output.feather")

      const result = await plugin.saveTable(table, options)

      expect(mockSaveArrowTable).toHaveBeenCalledWith(table, {
        ...options,
        fileDialect: { format: "arrow" },
      })
      expect(result).toBe("output.feather")
    })

    it("should return undefined for non-arrow files", async () => {
      const table = pl.DataFrame().lazy()
      const options = { path: "output.csv" }

      const result = await plugin.saveTable(table, options)

      expect(mockSaveArrowTable).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should handle explicit arrow format specification", async () => {
      const table = pl.DataFrame().lazy()
      const options = {
        path: "output.txt",
        fileDialect: { format: "arrow" } as const,
      }
      mockSaveArrowTable.mockResolvedValue("output.txt")

      const result = await plugin.saveTable(table, options)

      expect(mockSaveArrowTable).toHaveBeenCalledWith(table, options)
      expect(result).toBe("output.txt")
    })

    it("should handle paths with directories", async () => {
      const table = pl.DataFrame().lazy()
      const options = { path: "/path/to/output.arrow" }
      mockSaveArrowTable.mockResolvedValue("/path/to/output.arrow")

      await plugin.saveTable(table, options)

      expect(mockSaveArrowTable).toHaveBeenCalledWith(table, {
        ...options,
        fileDialect: { format: "arrow" },
      })
    })

    it("should return undefined for files without extension", async () => {
      const table = pl.DataFrame().lazy()
      const options = { path: "output" }

      const result = await plugin.saveTable(table, options)

      expect(mockSaveArrowTable).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should return undefined for parquet files", async () => {
      const table = pl.DataFrame().lazy()
      const options = { path: "output.parquet" }

      const result = await plugin.saveTable(table, options)

      expect(mockSaveArrowTable).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })
})
