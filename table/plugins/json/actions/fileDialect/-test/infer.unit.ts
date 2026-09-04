import { writeTempFile } from "@fairspec/dataset"
import type { Resource } from "@fairspec/metadata"
import { describe, expect, it } from "vite-plus/test"
import { inferJsonFileDialect } from "../infer.ts"

describe("inferJsonFileDialect", () => {
  describe("JSON array of objects", () => {
    it("should detect rowType as object without headerRows", async () => {
      const body = '[{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]'
      const path = await writeTempFile(body)

      const resource: Resource = {
        data: path,
        fileDialect: { format: "json" },
      }

      const result = await inferJsonFileDialect(resource)

      expect(result).toEqual({
        format: "json",
        rowType: "object",
      })
    })
  })

  describe("JSON array of arrays", () => {
    it("should detect headers when first row is header", async () => {
      const body = '[["id", "name"], [1, "Alice"], [2, "Bob"]]'
      const path = await writeTempFile(body)

      const resource: Resource = {
        data: path,
        fileDialect: { format: "json" },
      }

      const result = await inferJsonFileDialect(resource)

      expect(result).toEqual({
        format: "json",
        rowType: "array",
        headerRows: [1],
      })
    })

    it("should detect no headers when data rows only", async () => {
      const body = "[[1, 2, 3], [4, 5, 6], [7, 8, 9]]"
      const path = await writeTempFile(body)

      const resource: Resource = {
        data: path,
        fileDialect: { format: "json" },
      }

      const result = await inferJsonFileDialect(resource)

      expect(result).toEqual({
        format: "json",
        rowType: "array",
        headerRows: false,
      })
    })
  })

  describe("nested JSON with jsonPointer", () => {
    it("should detect jsonPointer for nested data structure", async () => {
      const body =
        '{"metadata": {"version": "1.0"}, "data": [["id", "name"], [1, "Alice"], [2, "Bob"]]}'
      const path = await writeTempFile(body)

      const resource: Resource = {
        data: path,
        fileDialect: { format: "json" },
      }

      const result = await inferJsonFileDialect(resource)

      expect(result).toMatchObject({
        format: "json",
        jsonPointer: "data",
        rowType: "array",
      })
    })

    it("should detect jsonPointer with array of objects", async () => {
      const body =
        '{"metadata": {"version": "1.0"}, "records": [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]}'
      const path = await writeTempFile(body)

      const resource: Resource = {
        data: path,
        fileDialect: { format: "json" },
      }

      const result = await inferJsonFileDialect(resource)

      expect(result).toEqual({
        format: "json",
        jsonPointer: "records",
        rowType: "object",
      })
    })
  })

  describe("JSONL format", () => {
    it("should detect rowType for array JSONL", async () => {
      const body = '[1, "Alice", 30]\n[2, "Bob", 25]\n[3, "Charlie", 35]'
      const path = await writeTempFile(body)

      const resource: Resource = {
        data: path,
        fileDialect: { format: "jsonl" },
      }

      const result = await inferJsonFileDialect(resource)

      expect(result).toEqual({
        format: "jsonl",
        rowType: "array",
        headerRows: false,
      })
    })

    it("should detect rowType for object JSONL", async () => {
      const body =
        '{"id": 1, "name": "Alice"}\n{"id": 2, "name": "Bob"}\n{"id": 3, "name": "Charlie"}'
      const path = await writeTempFile(body)

      const resource: Resource = {
        data: path,
        fileDialect: { format: "jsonl" },
      }

      const result = await inferJsonFileDialect(resource)

      expect(result).toEqual({
        format: "jsonl",
        rowType: "object",
      })
    })
  })

  describe("edge cases", () => {
    it("should return format only for empty array", async () => {
      const body = "[]"
      const path = await writeTempFile(body)

      const resource: Resource = {
        data: path,
        fileDialect: { format: "json" },
      }

      const result = await inferJsonFileDialect(resource)

      expect(result).toEqual({
        format: "json",
      })
    })

    it("should return format only for invalid JSON", async () => {
      const body = "{this is not valid json"
      const path = await writeTempFile(body)

      const resource: Resource = {
        data: path,
        fileDialect: { format: "json" },
      }

      const result = await inferJsonFileDialect(resource)

      expect(result).toEqual({
        format: "json",
      })
    })

    it("should return undefined for inline data", async () => {
      const resource: Resource = {
        data: [
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ],
        fileDialect: { format: "json" },
      }

      const result = await inferJsonFileDialect(resource)

      expect(result).toBeUndefined()
    })

    it("should return undefined for unsupported format", async () => {
      const body = "id,name\n1,Alice\n2,Bob"
      const path = await writeTempFile(body)

      const resource: Resource = {
        data: path,
        fileDialect: { format: "csv" },
      }

      const result = await inferJsonFileDialect(resource)

      expect(result).toBeUndefined()
    })

    it("should return format only for single row array", async () => {
      const body = "[[1, 2, 3]]"
      const path = await writeTempFile(body)

      const resource: Resource = {
        data: path,
        fileDialect: { format: "json" },
      }

      const result = await inferJsonFileDialect(resource)

      expect(result).toEqual({
        format: "json",
        rowType: "array",
        headerRows: false,
      })
    })

    it("should handle non-file path errors gracefully", async () => {
      const resource: Resource = {
        data: "/nonexistent/path/to/file.json",
        fileDialect: { format: "json" },
      }

      const result = await inferJsonFileDialect(resource)

      expect(result).toEqual({
        format: "json",
      })
    })
  })
})
