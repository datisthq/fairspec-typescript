import { writeTempFile } from "@fairspec/dataset"
import type { Resource } from "@fairspec/metadata"
import { describe, expect, it } from "vite-plus/test"
import { utils, write } from "xlsx"
import { inferXlsxFileDialect } from "../infer.ts"

describe("inferXlsxFileDialect", () => {
  async function createXlsxFile(rows: unknown[][]): Promise<string> {
    const ws = utils.aoa_to_sheet(rows)
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, "Sheet1")
    const buffer = write(wb, { type: "buffer", bookType: "xlsx" })
    return await writeTempFile(buffer, { format: "xlsx" })
  }

  it("should detect header row with text headers", async () => {
    const path = await createXlsxFile([
      ["id", "name", "age"],
      [1, "Alice", 25],
      [2, "Bob", 30],
    ])

    const fileDialect = await inferXlsxFileDialect({ data: path })

    expect(fileDialect).toEqual({
      format: "xlsx",
      headerRows: [1],
    })
  })

  it("should not detect header when first row is numeric", async () => {
    const path = await createXlsxFile([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ])

    const fileDialect = await inferXlsxFileDialect({ data: path })

    expect(fileDialect).toEqual({
      format: "xlsx",
      headerRows: false,
    })
  })

  it("should detect header with mixed case and underscores", async () => {
    const path = await createXlsxFile([
      ["user_id", "User_Name", "EmailAddress"],
      [1, "alice", "alice@example.com"],
      [2, "bob", "bob@example.com"],
    ])

    const fileDialect = await inferXlsxFileDialect({ data: path })

    expect(fileDialect).toEqual({
      format: "xlsx",
      headerRows: [1],
    })
  })

  it("should not detect header with boolean values in first row", async () => {
    const path = await createXlsxFile([
      ["someId", 37257, 695.8, false, "2024-01-01"],
      ["anotherId", 68694, 337.73, true, "2024-01-02"],
      ["thirdId", 52019, 988.74, false, "2024-01-03"],
    ])

    const fileDialect = await inferXlsxFileDialect({ data: path })

    expect(fileDialect).toEqual({
      format: "xlsx",
      headerRows: false,
    })
  })

  it("should handle single row files", async () => {
    const path = await createXlsxFile([["id", "name", "age"]])

    const fileDialect = await inferXlsxFileDialect({ data: path })

    expect(fileDialect).toEqual({
      format: "xlsx",
      headerRows: false,
    })
  })

  it("should handle empty files", async () => {
    const path = await createXlsxFile([])

    const fileDialect = await inferXlsxFileDialect({ data: path })

    expect(fileDialect).toEqual({
      format: "xlsx",
    })
  })

  it("should return undefined for incompatible format", async () => {
    const resource: Resource = {
      data: "test.csv",
      fileDialect: { format: "csv" },
    }

    const fileDialect = await inferXlsxFileDialect(resource)
    expect(fileDialect).toBeUndefined()
  })

  it("should return undefined for resources without path", async () => {
    const resource: Resource = {
      data: [{ id: 1, name: "alice" }],
    }

    const fileDialect = await inferXlsxFileDialect(resource)
    expect(fileDialect).toBeUndefined()
  })

  it("should respect sheetNumber from existing dialect", async () => {
    const ws1 = utils.aoa_to_sheet([
      [1, 2, 3],
      [4, 5, 6],
    ])
    const ws2 = utils.aoa_to_sheet([
      ["id", "name"],
      [1, "Alice"],
      [2, "Bob"],
    ])
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws1, "Sheet1")
    utils.book_append_sheet(wb, ws2, "Sheet2")
    const buffer = write(wb, { type: "buffer", bookType: "xlsx" })
    const path = await writeTempFile(buffer, { format: "xlsx" })

    const fileDialect = await inferXlsxFileDialect({
      data: path,
      fileDialect: { format: "xlsx", sheetNumber: 2 },
    })

    expect(fileDialect).toEqual({
      format: "xlsx",
      headerRows: [1],
    })
  })

  it("should respect sheetName from existing dialect", async () => {
    const ws1 = utils.aoa_to_sheet([[1, 2, 3]])
    const ws2 = utils.aoa_to_sheet([
      ["id", "name"],
      [1, "Alice"],
    ])
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws1, "Data")
    utils.book_append_sheet(wb, ws2, "Headers")
    const buffer = write(wb, { type: "buffer", bookType: "xlsx" })
    const path = await writeTempFile(buffer, { format: "xlsx" })

    const fileDialect = await inferXlsxFileDialect({
      data: path,
      fileDialect: { format: "xlsx", sheetName: "Headers" },
    })

    expect(fileDialect).toEqual({
      format: "xlsx",
      headerRows: [1],
    })
  })

  it("should support ODS format", async () => {
    const ws = utils.aoa_to_sheet([
      ["id", "name", "age"],
      [1, "Alice", 25],
      [2, "Bob", 30],
    ])
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, "Sheet1")
    const buffer = write(wb, { type: "buffer", bookType: "ods" })
    const path = await writeTempFile(buffer, { format: "ods" })

    const fileDialect = await inferXlsxFileDialect({
      data: path,
      fileDialect: { format: "ods" },
    })

    expect(fileDialect).toEqual({
      format: "ods",
      headerRows: [1],
    })
  })
})
