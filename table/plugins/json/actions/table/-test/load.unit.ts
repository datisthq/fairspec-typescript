import { writeTempFile } from "@fairspec/dataset"
import { describe, expect, it } from "vite-plus/test"
import { useRecording } from "vitest-polly"
import { loadJsonTable } from "../load.ts"

useRecording()

describe("loadJsonTable", () => {
  describe("file variations", () => {
    it("should load local file", async () => {
      const body = '[{"id":1,"name":"english"},{"id":2,"name":"中文"}]'
      const path = await writeTempFile(body)

      const table = await loadJsonTable({
        data: path,
        fileDialect: { format: "json" },
      })

      expect((await table.collect()).toRecords()).toEqual([
        { id: 1, name: "english" },
        { id: 2, name: "中文" },
      ])
    })

    it("should load local file (multipart)", async () => {
      const body = '[{"id":1,"name":"english"},{"id":2,"name":"中文"}]'
      const path1 = await writeTempFile(body)
      const path2 = await writeTempFile(body)

      const table = await loadJsonTable({
        data: [path1, path2],
        fileDialect: { format: "json" },
      })

      expect((await table.collect()).toRecords()).toEqual([
        { id: 1, name: "english" },
        { id: 2, name: "中文" },
        { id: 1, name: "english" },
        { id: 2, name: "中文" },
      ])
    })

    it.skip("should load remote file", async () => {
      const table = await loadJsonTable({
        data: "https://github.com/datisthq/fairspec-typescript/raw/refs/heads/main/table/plugins/json/table/fixtures/table.json",
      })

      expect((await table.collect()).toRecords()).toEqual([
        { id: 1, name: "english" },
        { id: 2, name: "中文" },
      ])
    })

    it.skip("should load remote file (multipart)", async () => {
      const table = await loadJsonTable({
        data: [
          "https://github.com/datisthq/fairspec-typescript/raw/refs/heads/main/table/plugins/json/table/fixtures/table.json",
          "https://github.com/datisthq/fairspec-typescript/raw/refs/heads/main/table/plugins/json/table/fixtures/table.json",
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
    it("should handle property", async () => {
      const body = '{"key": [{"id":1,"name":"english"},{"id":2,"name":"中文"}]}'
      const path = await writeTempFile(body)

      const table = await loadJsonTable({
        data: path,
        fileDialect: { format: "json", jsonPointer: "key" },
      })

      expect((await table.collect()).toRecords()).toEqual([
        { id: 1, name: "english" },
        { id: 2, name: "中文" },
      ])
    })

    it("should handle item keys", async () => {
      const body = '[{"id":1,"name":"english"},{"id":2,"name":"中文"}]'
      const path = await writeTempFile(body)

      const table = await loadJsonTable({
        data: path,
        fileDialect: { format: "json", columnNames: ["name"] },
      })

      expect((await table.collect()).toRecords()).toEqual([
        { name: "english" },
        { name: "中文" },
      ])
    })

    it("should handle item type (array)", async () => {
      const body = '[["id","name"],[1,"english"],[2,"中文"]]'
      const path = await writeTempFile(body)

      const table = await loadJsonTable({
        data: path,
        fileDialect: { format: "json", rowType: "array" },
      })

      expect((await table.collect()).toRecords()).toEqual([
        { id: 1, name: "english" },
        { id: 2, name: "中文" },
      ])
    })

    it("should load item type (object)", async () => {
      const body = '[{"id":1,"name":"english"},{"id":2,"name":"中文"}]'
      const path = await writeTempFile(body)

      const table = await loadJsonTable({
        data: path,
        fileDialect: { format: "json", rowType: "object" },
      })

      expect((await table.collect()).toRecords()).toEqual([
        { id: 1, name: "english" },
        { id: 2, name: "中文" },
      ])
    })
  })
})

describe("loadJsonTable (format=jsonl)", () => {
  describe("file variations", () => {
    it("should load local file", async () => {
      const body = '{"id":1,"name":"english"}\n{"id":2,"name":"中文"}'
      const path = await writeTempFile(body)

      const table = await loadJsonTable({
        data: path,
        fileDialect: { format: "jsonl" },
      })

      expect((await table.collect()).toRecords()).toEqual([
        { id: 1, name: "english" },
        { id: 2, name: "中文" },
      ])
    })

    it("should load local file (multipart)", async () => {
      const body = '{"id":1,"name":"english"}\n{"id":2,"name":"中文"}'
      const path1 = await writeTempFile(body)
      const path2 = await writeTempFile(body)

      const table = await loadJsonTable({
        data: [path1, path2],
        fileDialect: { format: "jsonl" },
      })

      expect((await table.collect()).toRecords()).toEqual([
        { id: 1, name: "english" },
        { id: 2, name: "中文" },
        { id: 1, name: "english" },
        { id: 2, name: "中文" },
      ])
    })

    it.skip("should load remote file", async () => {
      const table = await loadJsonTable({
        data: "https://github.com/datisthq/fairspec-typescript/raw/refs/heads/main/table/plugins/json/table/fixtures/table.jsonl",
        fileDialect: { format: "jsonl" },
      })

      expect((await table.collect()).toRecords()).toEqual([
        { id: 1, name: "english" },
        { id: 2, name: "中文" },
      ])
    })

    it.skip("should load remote file (multipart)", async () => {
      const table = await loadJsonTable({
        data: [
          "https://github.com/datisthq/fairspec-typescript/raw/refs/heads/main/table/plugins/json/table/fixtures/table.jsonl",
          "https://github.com/datisthq/fairspec-typescript/raw/refs/heads/main/table/plugins/json/table/fixtures/table.jsonl",
        ],
        fileDialect: { format: "jsonl" },
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
    it("should handle item keys", async () => {
      const body = '{"id":1,"name":"english"}\n{"id":2,"name":"中文"}'
      const path = await writeTempFile(body)

      const table = await loadJsonTable({
        data: path,
        fileDialect: { format: "jsonl", columnNames: ["name"] },
      })

      expect((await table.collect()).toRecords()).toEqual([
        { name: "english" },
        { name: "中文" },
      ])
    })

    it("should handle item type (array)", async () => {
      const body = '["id","name"]\n[1,"english"]\n[2,"中文"]'
      const path = await writeTempFile(body)

      const table = await loadJsonTable({
        data: path,
        fileDialect: { format: "jsonl", rowType: "array" },
      })

      expect((await table.collect()).toRecords()).toEqual([
        { id: 1, name: "english" },
        { id: 2, name: "中文" },
      ])
    })

    it("should load item type (object)", async () => {
      const body = '{"id":1,"name":"english"}\n{"id":2,"name":"中文"}'
      const path = await writeTempFile(body)

      const table = await loadJsonTable({
        data: path,
        fileDialect: { format: "jsonl", rowType: "object" },
      })

      expect((await table.collect()).toRecords()).toEqual([
        { id: 1, name: "english" },
        { id: 2, name: "中文" },
      ])
    })
  })
})
