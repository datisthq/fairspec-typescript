import type { Resource } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { beforeEach, describe, expect, it, vi } from "vite-plus/test"
import * as loadModule from "../actions/table/load.ts"
import * as saveModule from "../actions/table/save.ts"
import { CsvPlugin } from "../plugin.ts"

vi.mock("../actions/table/load.ts", () => ({
  loadCsvTable: vi.fn(),
}))

vi.mock("../actions/table/save.ts", () => ({
  saveCsvTable: vi.fn(),
}))

describe("CsvPlugin", () => {
  let plugin: CsvPlugin
  let mockLoadCsvTable: ReturnType<typeof vi.fn>
  let mockSaveCsvTable: ReturnType<typeof vi.fn>

  beforeEach(() => {
    plugin = new CsvPlugin()
    mockLoadCsvTable = vi.mocked(loadModule.loadCsvTable)
    mockSaveCsvTable = vi.mocked(saveModule.saveCsvTable)
    vi.clearAllMocks()
  })

  describe("loadTable", () => {
    it("should load table from csv file", async () => {
      const resource: Resource = {
        data: "test.csv",
      }
      const mockTable = pl.DataFrame().lazy()
      mockLoadCsvTable.mockResolvedValue(mockTable)

      const result = await plugin.loadTable(resource)

      expect(mockLoadCsvTable).toHaveBeenCalledWith(
        { ...resource, fileDialect: { format: "csv" } },
        undefined,
      )
      expect(result).toEqual(mockTable)
    })

    it("should load table from tsv file", async () => {
      const resource: Resource = {
        data: "test.tsv",
      }
      const mockTable = pl.DataFrame().lazy()
      mockLoadCsvTable.mockResolvedValue(mockTable)

      const result = await plugin.loadTable(resource)

      expect(mockLoadCsvTable).toHaveBeenCalledWith(
        { ...resource, fileDialect: { format: "tsv" } },
        undefined,
      )
      expect(result).toEqual(mockTable)
    })

    it("should return undefined for non-csv files", async () => {
      const resource: Resource = {
        data: "test.json",
      }

      const result = await plugin.loadTable(resource)

      expect(mockLoadCsvTable).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should handle explicit format specification", async () => {
      const resource: Resource = {
        data: "test.txt",
        fileDialect: { format: "csv" },
      }
      const mockTable = pl.DataFrame().lazy()
      mockLoadCsvTable.mockResolvedValue(mockTable)

      const result = await plugin.loadTable(resource)

      expect(mockLoadCsvTable).toHaveBeenCalledWith(
        { ...resource, fileDialect: { format: "csv" } },
        undefined,
      )
      expect(result).toEqual(mockTable)
    })

    it("should pass through load options", async () => {
      const resource: Resource = {
        data: "test.csv",
      }
      const options = { denormalized: true }
      const mockTable = pl.DataFrame().lazy()
      mockLoadCsvTable.mockResolvedValue(mockTable)

      await plugin.loadTable(resource, options)

      expect(mockLoadCsvTable).toHaveBeenCalledWith(
        { ...resource, fileDialect: { format: "csv" } },
        options,
      )
    })

    it("should handle paths with directories", async () => {
      const resource: Resource = {
        data: "/path/to/data.csv",
      }
      const mockTable = pl.DataFrame().lazy()
      mockLoadCsvTable.mockResolvedValue(mockTable)

      await plugin.loadTable(resource)

      expect(mockLoadCsvTable).toHaveBeenCalledWith(
        { ...resource, fileDialect: { format: "csv" } },
        undefined,
      )
    })

    it("should handle explicit tsv format specification", async () => {
      const resource: Resource = {
        data: "test.txt",
        fileDialect: { format: "tsv" },
      }
      const mockTable = pl.DataFrame().lazy()
      mockLoadCsvTable.mockResolvedValue(mockTable)

      const result = await plugin.loadTable(resource)

      expect(mockLoadCsvTable).toHaveBeenCalledWith(
        { ...resource, fileDialect: { format: "tsv" } },
        undefined,
      )
      expect(result).toEqual(mockTable)
    })
  })

  describe("saveTable", () => {
    it("should save table to csv file", async () => {
      const table = pl.DataFrame().lazy()
      const options = { path: "output.csv" }
      mockSaveCsvTable.mockResolvedValue("output.csv")

      const result = await plugin.saveTable(table, options)

      expect(mockSaveCsvTable).toHaveBeenCalledWith(table, {
        ...options,
        fileDialect: { format: "csv" },
      })
      expect(result).toBe("output.csv")
    })

    it("should save table to tsv file", async () => {
      const table = pl.DataFrame().lazy()
      const options = { path: "output.tsv" }
      mockSaveCsvTable.mockResolvedValue("output.tsv")

      const result = await plugin.saveTable(table, options)

      expect(mockSaveCsvTable).toHaveBeenCalledWith(table, {
        ...options,
        fileDialect: { format: "tsv" },
      })
      expect(result).toBe("output.tsv")
    })

    it("should return undefined for non-csv files", async () => {
      const table = pl.DataFrame().lazy()
      const options = { path: "output.json" }

      const result = await plugin.saveTable(table, options)

      expect(mockSaveCsvTable).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should handle explicit format specification", async () => {
      const table = pl.DataFrame().lazy()
      const options = {
        path: "output.txt",
        fileDialect: { format: "csv" as const },
      }
      mockSaveCsvTable.mockResolvedValue("output.txt")

      const result = await plugin.saveTable(table, options)

      expect(mockSaveCsvTable).toHaveBeenCalledWith(table, {
        ...options,
        fileDialect: { format: "csv" },
      })
      expect(result).toBe("output.txt")
    })

    it("should handle paths with directories", async () => {
      const table = pl.DataFrame().lazy()
      const options = { path: "/path/to/output.csv" }
      mockSaveCsvTable.mockResolvedValue("/path/to/output.csv")

      await plugin.saveTable(table, options)

      expect(mockSaveCsvTable).toHaveBeenCalledWith(table, {
        ...options,
        fileDialect: { format: "csv" },
      })
    })

    it("should return undefined for files without extension", async () => {
      const table = pl.DataFrame().lazy()
      const options = { path: "output" }

      const result = await plugin.saveTable(table, options)

      expect(mockSaveCsvTable).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should handle explicit tsv format specification", async () => {
      const table = pl.DataFrame().lazy()
      const options = {
        path: "output.txt",
        fileDialect: { format: "tsv" as const },
      }
      mockSaveCsvTable.mockResolvedValue("output.txt")

      const result = await plugin.saveTable(table, options)

      expect(mockSaveCsvTable).toHaveBeenCalledWith(table, {
        ...options,
        fileDialect: { format: "tsv" },
      })
      expect(result).toBe("output.txt")
    })
  })
})
