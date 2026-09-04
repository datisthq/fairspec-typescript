import { getTempFilePath } from "@fairspec/dataset"
import { describe, expect, it } from "vite-plus/test"
import { useRecording } from "vitest-polly"
import { loadXlsxTable } from "../load.ts"
import { writeTestData } from "./test.ts"

useRecording()

const row1 = ["id", "name"]
const row2 = [1, "english"]
const row3 = [2, "中文"]

const record1 = { id: 1, name: "english" }
const record2 = { id: 2, name: "中文" }

describe("loadXlsxTable (format=xlsx)", () => {
  describe("file variations", () => {
    it("should load local file", async () => {
      const path = getTempFilePath()
      await writeTestData(path, [row1, row2, row3])

      const table = await loadXlsxTable({
        data: path,
        fileDialect: { format: "xlsx" },
      })

      expect((await table.collect()).toRecords()).toEqual([record1, record2])
    })

    it("should load local file (multipart)", async () => {
      const path1 = getTempFilePath()
      const path2 = getTempFilePath()
      await writeTestData(path1, [row1, row2, row3])
      await writeTestData(path2, [row1, row2, row3])

      const table = await loadXlsxTable({
        data: [path1, path2],
        fileDialect: { format: "xlsx" },
      })

      expect((await table.collect()).toRecords()).toEqual([
        record1,
        record2,
        record1,
        record2,
      ])
    })

    it.skip("should load remote file", async () => {
      const table = await loadXlsxTable({
        data: "https://github.com/datisthq/fairspec-typescript/raw/refs/heads/main/table/plugins/xlxs/table/fixtures/table.xlsx",
      })

      expect((await table.collect()).toRecords()).toEqual([
        { id: 1, name: "english" },
        { id: 2, name: "中文" },
      ])
    })

    it.skip("should load multipart remote file", async () => {
      const table = await loadXlsxTable({
        data: [
          "https://github.com/datisthq/fairspec-typescript/raw/refs/heads/main/table/plugins/xlxs/table/fixtures/table.xlsx",
          "https://github.com/datisthq/fairspec-typescript/raw/refs/heads/main/table/plugins/xlxs/table/fixtures/table.xlsx",
        ],
      })

      expect((await table.collect()).toRecords()).toEqual([
        { id: 1, name: "english" },
        { id: 2, name: "中文" },
        { id: 1, name: "english" },
        { id: 2, name: "中文" },
      ])
    })
  })

  describe("format variations", () => {
    it("should support sheetNumber", async () => {
      const path = getTempFilePath()
      await writeTestData(path, [row1, row2, row3], { sheetNumber: 2 })

      const table = await loadXlsxTable({
        data: path,
        fileDialect: { format: "xlsx", sheetNumber: 2 },
      })

      expect((await table.collect()).toRecords()).toEqual([record1, record2])
    })

    it("should support sheetName", async () => {
      const path = getTempFilePath()
      await writeTestData(path, [row1, row2, row3], { sheetName: "Sheet2" })

      const table = await loadXlsxTable({
        data: path,
        fileDialect: { format: "xlsx", sheetName: "Sheet2" },
      })

      expect((await table.collect()).toRecords()).toEqual([record1, record2])
    })

    it("should support no header", async () => {
      const path = getTempFilePath()
      await writeTestData(path, [row2, row3])

      const table = await loadXlsxTable({
        data: path,
        fileDialect: { format: "xlsx", headerRows: false },
      })

      expect((await table.collect()).toRecords()).toEqual([
        { column1: 1, column2: "english" },
        { column1: 2, column2: "中文" },
      ])
    })

    it("should support headerRows offset", async () => {
      const path = getTempFilePath()
      await writeTestData(path, [row1, row2, row3])

      const table = await loadXlsxTable({
        data: path,
        fileDialect: { format: "xlsx", headerRows: [2] },
      })

      expect((await table.collect()).toRecords()).toEqual([{ 1: 2, english: "中文" }])
    })

    it("should support multiline headerRows", async () => {
      const path = getTempFilePath()
      await writeTestData(path, [row1, row2, row3])

      const table = await loadXlsxTable({
        data: path,
        fileDialect: { format: "xlsx", headerRows: [1, 2] },
      })

      expect((await table.collect()).toRecords()).toEqual([
        { "id 1": 2, "name english": "中文" },
      ])
    })

    it("should support headerJoin", async () => {
      const path = getTempFilePath()
      await writeTestData(path, [row1, row2, row3])

      const table = await loadXlsxTable({
        data: path,
        fileDialect: { format: "xlsx", headerRows: [1, 2], headerJoin: "-" },
      })

      expect((await table.collect()).toRecords()).toEqual([
        { "id-1": 2, "name-english": "中文" },
      ])
    })

    it("should support commentRows", async () => {
      const path = getTempFilePath()
      await writeTestData(path, [row1, row2, row3])

      const table = await loadXlsxTable({
        data: path,
        fileDialect: { format: "xlsx", commentRows: [2] },
      })

      expect((await table.collect()).toRecords()).toEqual([record2])
    })

    it("should support commentPrefix", async () => {
      const path = getTempFilePath()
      await writeTestData(path, [row1, row2, row3, ["#comment"]])

      const table = await loadXlsxTable({
        data: path,
        fileDialect: { format: "xlsx", commentPrefix: "#" },
      })

      expect((await table.collect()).toRecords()).toEqual([record1, record2])
    })

    it("should handle longer rows", async () => {
      const path = getTempFilePath()
      await writeTestData(path, [row1, row2, row3, [3, "german", "bad"]])

      const table = await loadXlsxTable({
        data: path,
        fileDialect: { format: "xlsx", commentPrefix: "#" },
      })

      expect((await table.collect()).toRecords()).toEqual([
        record1,
        record2,
        { id: 3, name: "german" },
      ])
    })

    it("should handle shorter rows", async () => {
      const path = getTempFilePath()
      await writeTestData(path, [row1, row2, row3, [3]])

      const table = await loadXlsxTable({
        data: path,
        fileDialect: { format: "xlsx", commentPrefix: "#" },
      })

      expect((await table.collect()).toRecords()).toEqual([
        record1,
        record2,
        { id: 3, name: null },
      ])
    })
  })
})

describe("loadXlsxTable (format=ods)", () => {
  describe("file variations", () => {
    it("should load local file", async () => {
      const path = getTempFilePath()
      await writeTestData(path, [row1, row2, row3], { format: "ods" })

      const table = await loadXlsxTable({
        data: path,
        fileDialect: { format: "ods" },
      })
      expect((await table.collect()).toRecords()).toEqual([record1, record2])
    })

    it("should load local file (multipart)", async () => {
      const path1 = getTempFilePath()
      const path2 = getTempFilePath()
      await writeTestData(path1, [row1, row2, row3], { format: "ods" })
      await writeTestData(path2, [row1, row2, row3], { format: "ods" })

      const table = await loadXlsxTable({
        data: [path1, path2],
        fileDialect: { format: "ods" },
      })
      expect((await table.collect()).toRecords()).toEqual([
        record1,
        record2,
        record1,
        record2,
      ])
    })

    it.skip("should load remote file", async () => {
      const table = await loadXlsxTable({
        data: "https://github.com/datisthq/fairspec-typescript/raw/refs/heads/main/table/plugins/ods/table/fixtures/table.ods",
        fileDialect: { format: "ods" },
      })

      expect((await table.collect()).toRecords()).toEqual([
        { id: 1, name: "english" },
        { id: 2, name: "中文" },
      ])
    })

    it.skip("should load multipart remote file", async () => {
      const table = await loadXlsxTable({
        data: [
          "https://github.com/datisthq/fairspec-typescript/raw/refs/heads/main/table/plugins/ods/table/fixtures/table.ods",
          "https://github.com/datisthq/fairspec-typescript/raw/refs/heads/main/table/plugins/ods/table/fixtures/table.ods",
        ],
        fileDialect: { format: "ods" },
      })

      expect((await table.collect()).toRecords()).toEqual([
        { id: 1, name: "english" },
        { id: 2, name: "中文" },
        { id: 1, name: "english" },
        { id: 2, name: "中文" },
      ])
    })
  })

  describe("format variations", () => {
    it("should support sheetNumber", async () => {
      const path = getTempFilePath()
      await writeTestData(path, [row1, row2, row3], {
        sheetNumber: 2,
        format: "ods",
      })

      const table = await loadXlsxTable({
        data: path,
        fileDialect: { format: "ods", sheetNumber: 2 },
      })

      expect((await table.collect()).toRecords()).toEqual([record1, record2])
    })

    it("should support sheetName", async () => {
      const path = getTempFilePath()
      await writeTestData(path, [row1, row2, row3], {
        sheetName: "Sheet2",
        format: "ods",
      })

      const table = await loadXlsxTable({
        data: path,
        fileDialect: { format: "ods", sheetName: "Sheet2" },
      })

      expect((await table.collect()).toRecords()).toEqual([record1, record2])
    })

    it("should support no header", async () => {
      const path = getTempFilePath()
      await writeTestData(path, [row2, row3], { format: "ods" })

      const table = await loadXlsxTable({
        data: path,
        fileDialect: { format: "ods", headerRows: false },
      })

      expect((await table.collect()).toRecords()).toEqual([
        { column1: 1, column2: "english" },
        { column1: 2, column2: "中文" },
      ])
    })

    it("should support headerRows offset", async () => {
      const path = getTempFilePath()
      await writeTestData(path, [row1, row2, row3], { format: "ods" })

      const table = await loadXlsxTable({
        data: path,
        fileDialect: { format: "ods", headerRows: [2] },
      })

      expect((await table.collect()).toRecords()).toEqual([{ 1: 2, english: "中文" }])
    })

    it("should support multiline headerRows", async () => {
      const path = getTempFilePath()
      await writeTestData(path, [row1, row2, row3], { format: "ods" })

      const table = await loadXlsxTable({
        data: path,
        fileDialect: { format: "ods", headerRows: [1, 2] },
      })

      expect((await table.collect()).toRecords()).toEqual([
        { "id 1": 2, "name english": "中文" },
      ])
    })

    it("should support headerJoin", async () => {
      const path = getTempFilePath()
      await writeTestData(path, [row1, row2, row3], { format: "ods" })

      const table = await loadXlsxTable({
        data: path,
        fileDialect: { format: "ods", headerRows: [1, 2], headerJoin: "-" },
      })

      expect((await table.collect()).toRecords()).toEqual([
        { "id-1": 2, "name-english": "中文" },
      ])
    })

    it("should support commentRows", async () => {
      const path = getTempFilePath()
      await writeTestData(path, [row1, row2, row3], { format: "ods" })

      const table = await loadXlsxTable({
        data: path,
        fileDialect: { format: "ods", commentRows: [2] },
      })

      expect((await table.collect()).toRecords()).toEqual([record2])
    })

    it("should support commentPrefix", async () => {
      const path = getTempFilePath()
      await writeTestData(path, [row1, row2, row3, ["#comment"]], {
        format: "ods",
      })

      const table = await loadXlsxTable({
        data: path,
        fileDialect: { format: "ods", commentPrefix: "#" },
      })

      expect((await table.collect()).toRecords()).toEqual([record1, record2])
    })

    it("should handle longer rows", async () => {
      const path = getTempFilePath()
      await writeTestData(path, [row1, row2, row3, [3, "german", "bad"]], {
        format: "ods",
      })

      const table = await loadXlsxTable({
        data: path,
        fileDialect: { format: "ods", commentPrefix: "#" },
      })

      expect((await table.collect()).toRecords()).toEqual([
        record1,
        record2,
        { id: 3, name: "german" },
      ])
    })

    it("should handle shorter rows", async () => {
      const path = getTempFilePath()
      await writeTestData(path, [row1, row2, row3, [3]], { format: "ods" })

      const table = await loadXlsxTable({
        data: path,
        fileDialect: { format: "ods", commentPrefix: "#" },
      })

      expect((await table.collect()).toRecords()).toEqual([
        record1,
        record2,
        { id: 3, name: null },
      ])
    })
  })
})
