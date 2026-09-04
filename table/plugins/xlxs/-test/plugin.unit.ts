import type { Resource } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { beforeEach, describe, expect, it, vi } from "vite-plus/test"
import * as loadModule from "../actions/table/load.ts"
import * as saveModule from "../actions/table/save.ts"
import { XlsxPlugin } from "../plugin.ts"

vi.mock("../actions/table/load.ts", () => ({
  loadXlsxTable: vi.fn(),
}))

vi.mock("../actions/table/save.ts", () => ({
  saveXlsxTable: vi.fn(),
}))

describe("XlsxPlugin", () => {
  let plugin: XlsxPlugin
  let mockLoadXlsxTable: ReturnType<typeof vi.fn>
  let mockSaveXlsxTable: ReturnType<typeof vi.fn>

  beforeEach(() => {
    plugin = new XlsxPlugin()
    mockLoadXlsxTable = vi.mocked(loadModule.loadXlsxTable)
    mockSaveXlsxTable = vi.mocked(saveModule.saveXlsxTable)
    vi.clearAllMocks()
  })

  describe("loadTable", () => {
    describe("xlsx format", () => {
      it("should load table from xlsx file", async () => {
        const resource: Resource = {
          data: "test.xlsx",
        }
        const mockTable = pl.DataFrame().lazy()
        mockLoadXlsxTable.mockResolvedValue(mockTable)

        const result = await plugin.loadTable(resource)

        expect(mockLoadXlsxTable).toHaveBeenCalledWith(
          { ...resource, fileDialect: { format: "xlsx" } },
          undefined,
        )
        expect(result).toEqual(mockTable)
      })

      it("should handle explicit format specification", async () => {
        const resource: Resource = {
          data: "test.txt",
          fileDialect: { format: "xlsx" },
        }
        const mockTable = pl.DataFrame().lazy()
        mockLoadXlsxTable.mockResolvedValue(mockTable)

        const result = await plugin.loadTable(resource)

        expect(mockLoadXlsxTable).toHaveBeenCalledWith(
          { ...resource, fileDialect: { format: "xlsx" } },
          undefined,
        )
        expect(result).toEqual(mockTable)
      })

      it("should pass through load options", async () => {
        const resource: Resource = {
          data: "test.xlsx",
        }
        const options = { denormalized: true }
        const mockTable = pl.DataFrame().lazy()
        mockLoadXlsxTable.mockResolvedValue(mockTable)

        await plugin.loadTable(resource, options)

        expect(mockLoadXlsxTable).toHaveBeenCalledWith(
          { ...resource, fileDialect: { format: "xlsx" } },
          options,
        )
      })

      it("should handle paths with directories", async () => {
        const resource: Resource = {
          data: "/path/to/data.xlsx",
        }
        const mockTable = pl.DataFrame().lazy()
        mockLoadXlsxTable.mockResolvedValue(mockTable)

        await plugin.loadTable(resource)

        expect(mockLoadXlsxTable).toHaveBeenCalledWith(
          { ...resource, fileDialect: { format: "xlsx" } },
          undefined,
        )
      })
    })

    describe("ods format", () => {
      it("should load table from ods file", async () => {
        const resource: Resource = {
          data: "test.ods",
        }
        const mockTable = pl.DataFrame().lazy()
        mockLoadXlsxTable.mockResolvedValue(mockTable)

        const result = await plugin.loadTable(resource)

        expect(mockLoadXlsxTable).toHaveBeenCalledWith(
          { ...resource, fileDialect: { format: "ods" } },
          undefined,
        )
        expect(result).toEqual(mockTable)
      })

      it("should handle explicit format specification", async () => {
        const resource: Resource = {
          data: "test.txt",
          fileDialect: { format: "ods" },
        }
        const mockTable = pl.DataFrame().lazy()
        mockLoadXlsxTable.mockResolvedValue(mockTable)

        const result = await plugin.loadTable(resource)

        expect(mockLoadXlsxTable).toHaveBeenCalledWith(
          { ...resource, fileDialect: { format: "ods" } },
          undefined,
        )
        expect(result).toEqual(mockTable)
      })

      it("should pass through load options", async () => {
        const resource: Resource = {
          data: "test.ods",
        }
        const options = { denormalized: true }
        const mockTable = pl.DataFrame().lazy()
        mockLoadXlsxTable.mockResolvedValue(mockTable)

        await plugin.loadTable(resource, options)

        expect(mockLoadXlsxTable).toHaveBeenCalledWith(
          { ...resource, fileDialect: { format: "ods" } },
          options,
        )
      })

      it("should handle paths with directories", async () => {
        const resource: Resource = {
          data: "/path/to/data.ods",
        }
        const mockTable = pl.DataFrame().lazy()
        mockLoadXlsxTable.mockResolvedValue(mockTable)

        await plugin.loadTable(resource)

        expect(mockLoadXlsxTable).toHaveBeenCalledWith(
          { ...resource, fileDialect: { format: "ods" } },
          undefined,
        )
      })
    })

    it("should return undefined for non-xlsx/ods files", async () => {
      const resource: Resource = {
        data: "test.csv",
      }

      const result = await plugin.loadTable(resource)

      expect(mockLoadXlsxTable).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should return undefined for json files", async () => {
      const resource: Resource = {
        data: "test.json",
      }

      const result = await plugin.loadTable(resource)

      expect(mockLoadXlsxTable).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })

  describe("saveTable", () => {
    describe("xlsx format", () => {
      it("should save table to xlsx file", async () => {
        const table = pl.DataFrame().lazy()
        const options = { path: "output.xlsx" }
        mockSaveXlsxTable.mockResolvedValue("output.xlsx")

        const result = await plugin.saveTable(table, options)

        expect(mockSaveXlsxTable).toHaveBeenCalledWith(table, {
          ...options,
          fileDialect: { format: "xlsx" },
        })
        expect(result).toBe("output.xlsx")
      })

      it("should handle explicit format specification", async () => {
        const table = pl.DataFrame().lazy()
        const options = {
          path: "output.txt",
          fileDialect: { format: "xlsx" as const },
        }
        mockSaveXlsxTable.mockResolvedValue("output.txt")

        const result = await plugin.saveTable(table, options)

        expect(mockSaveXlsxTable).toHaveBeenCalledWith(table, {
          ...options,
          fileDialect: { format: "xlsx" },
        })
        expect(result).toBe("output.txt")
      })

      it("should handle paths with directories", async () => {
        const table = pl.DataFrame().lazy()
        const options = { path: "/path/to/output.xlsx" }
        mockSaveXlsxTable.mockResolvedValue("/path/to/output.xlsx")

        await plugin.saveTable(table, options)

        expect(mockSaveXlsxTable).toHaveBeenCalledWith(table, {
          ...options,
          fileDialect: { format: "xlsx" },
        })
      })
    })

    describe("ods format", () => {
      it("should save table to ods file", async () => {
        const table = pl.DataFrame().lazy()
        const options = { path: "output.ods" }
        mockSaveXlsxTable.mockResolvedValue("output.ods")

        const result = await plugin.saveTable(table, options)

        expect(mockSaveXlsxTable).toHaveBeenCalledWith(table, {
          ...options,
          fileDialect: { format: "ods" },
        })
        expect(result).toBe("output.ods")
      })

      it("should handle explicit format specification", async () => {
        const table = pl.DataFrame().lazy()
        const options = {
          path: "output.txt",
          fileDialect: { format: "ods" as const },
        }
        mockSaveXlsxTable.mockResolvedValue("output.txt")

        const result = await plugin.saveTable(table, options)

        expect(mockSaveXlsxTable).toHaveBeenCalledWith(table, {
          ...options,
          fileDialect: { format: "ods" },
        })
        expect(result).toBe("output.txt")
      })

      it("should handle paths with directories", async () => {
        const table = pl.DataFrame().lazy()
        const options = { path: "/path/to/output.ods" }
        mockSaveXlsxTable.mockResolvedValue("/path/to/output.ods")

        await plugin.saveTable(table, options)

        expect(mockSaveXlsxTable).toHaveBeenCalledWith(table, {
          ...options,
          fileDialect: { format: "ods" },
        })
      })
    })

    it("should return undefined for non-xlsx/ods files", async () => {
      const table = pl.DataFrame().lazy()
      const options = { path: "output.csv" }

      const result = await plugin.saveTable(table, options)

      expect(mockSaveXlsxTable).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should return undefined for files without extension", async () => {
      const table = pl.DataFrame().lazy()
      const options = { path: "output" }

      const result = await plugin.saveTable(table, options)

      expect(mockSaveXlsxTable).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it("should return undefined for json files", async () => {
      const table = pl.DataFrame().lazy()
      const options = { path: "output.json" }

      const result = await plugin.saveTable(table, options)

      expect(mockSaveXlsxTable).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })
})
