import { describe, expect, it } from "vite-plus/test"
import { Sniffer } from "../sniffer.ts"

describe("Sniffer", () => {
  describe("sniffBytes", () => {
    it("should detect comma-delimited CSV", () => {
      const csv = "id,name,age\n1,Alice,25\n2,Bob,30"
      const bytes = new TextEncoder().encode(csv)
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffBytes(bytes)

      expect(metadata.dialect.delimiter).toBe(44) // comma
      expect(metadata.dialect.header.hasHeaderRow).toBe(true)
      expect(metadata.numFields).toBe(3)
      expect(metadata.fields).toEqual(["id", "name", "age"])
    })

    it("should detect tab-delimited TSV", () => {
      const tsv = "id\tname\tage\n1\tAlice\t25\n2\tBob\t30"
      const bytes = new TextEncoder().encode(tsv)
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffBytes(bytes)

      expect(metadata.dialect.delimiter).toBe(9) // tab
      expect(metadata.dialect.header.hasHeaderRow).toBe(true)
      expect(metadata.numFields).toBe(3)
    })

    it("should detect semicolon-delimited CSV", () => {
      const csv = "id;name;age\n1;Alice;25\n2;Bob;30"
      const bytes = new TextEncoder().encode(csv)
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffBytes(bytes)

      expect(metadata.dialect.delimiter).toBe(59) // semicolon
      expect(metadata.numFields).toBe(3)
    })

    it("should detect pipe-delimited CSV", () => {
      const csv = "id|name|age\n1|Alice|25\n2|Bob|30"
      const bytes = new TextEncoder().encode(csv)
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffBytes(bytes)

      expect(metadata.dialect.delimiter).toBe(124) // pipe
      expect(metadata.numFields).toBe(3)
    })

    it("should detect quoted fields", () => {
      const csv =
        'id,name,description\n1,"Alice","She said, ""Hello"""\n2,"Bob","Normal text"'
      const bytes = new TextEncoder().encode(csv)
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffBytes(bytes)

      expect(metadata.dialect.delimiter).toBe(44)
      expect(metadata.dialect.quote.type).toBe("Some")
      if (metadata.dialect.quote.type === "Some") {
        expect(metadata.dialect.quote.char).toBe(34) // double quote
      }
    })

    it("should detect CRLF line terminator", () => {
      const csv = "id,name\r\n1,Alice\r\n2,Bob"
      const bytes = new TextEncoder().encode(csv)
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffBytes(bytes)

      expect(metadata.dialect.delimiter).toBe(44)
      expect(metadata.numFields).toBe(2)
    })

    it("should detect CR line terminator", () => {
      const csv = "id,name\r1,Alice\r2,Bob"
      const bytes = new TextEncoder().encode(csv)
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffBytes(bytes)

      expect(metadata.dialect.delimiter).toBe(44)
      expect(metadata.numFields).toBe(2)
    })

    it("should detect CSV without header", () => {
      const csv = "1,Alice,25\n2,Bob,30\n3,Charlie,35"
      const bytes = new TextEncoder().encode(csv)
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffBytes(bytes)

      expect(metadata.dialect.header.hasHeaderRow).toBe(false)
      expect(metadata.fields).toEqual(["field_1", "field_2", "field_3"])
    })

    it("should skip comment preamble", () => {
      const csv = "# This is a comment\n# Another comment\nid,name\n1,Alice\n2,Bob"
      const bytes = new TextEncoder().encode(csv)
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffBytes(bytes)

      expect(metadata.dialect.header.numPreambleRows).toBe(2)
      expect(metadata.fields).toEqual(["id", "name"])
    })

    it("should detect structural preamble", () => {
      const csv = "Report Title\nReport Date: 2024-01-01\nid,name\n1,Alice\n2,Bob"
      const bytes = new TextEncoder().encode(csv)
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffBytes(bytes)

      expect(metadata.dialect.header.numPreambleRows).toBeGreaterThanOrEqual(1)
    })

    it("should handle UTF-8 BOM", () => {
      const bom = new Uint8Array([0xef, 0xbb, 0xbf])
      const csv = new TextEncoder().encode("id,name\n1,Alice")
      const bytes = new Uint8Array([...bom, ...csv])

      const sniffer = new Sniffer()
      const metadata = sniffer.sniffBytes(bytes)

      expect(metadata.dialect.delimiter).toBe(44)
      expect(metadata.fields).toEqual(["id", "name"])
    })

    it("should handle flexible mode for variable field counts", () => {
      const csv = "id,name\n1,Alice\n2,Bob,Extra\n3,Charlie"
      const bytes = new TextEncoder().encode(csv)
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffBytes(bytes)

      expect(metadata.dialect.flexible).toBe(true)
    })

    it("should allow forcing delimiter", () => {
      const csv = "id;name;age\n1;Alice;25\n2;Bob;30"
      const bytes = new TextEncoder().encode(csv)
      const sniffer = new Sniffer().withDelimiter(59)
      const metadata = sniffer.sniffBytes(bytes)

      expect(metadata.dialect.delimiter).toBe(59)
    })

    it("should allow forcing quote character", () => {
      const csv = "id,'name','age'\n1,'Alice','25'"
      const bytes = new TextEncoder().encode(csv)
      const sniffer = new Sniffer().withQuote({ type: "Some", char: 39 })
      const metadata = sniffer.sniffBytes(bytes)

      expect(metadata.dialect.quote.type).toBe("Some")
      if (metadata.dialect.quote.type === "Some") {
        expect(metadata.dialect.quote.char).toBe(39) // single quote
      }
    })

    it("should calculate average record length", () => {
      const csv = "id,name\n1,Alice\n2,Bob"
      const bytes = new TextEncoder().encode(csv)
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffBytes(bytes)

      expect(metadata.avgRecordLen).toBeGreaterThan(0)
    })

    it("should handle empty files", () => {
      const csv = ""
      const bytes = new TextEncoder().encode(csv)
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffBytes(bytes)

      expect(metadata.numFields).toBe(0)
    })

    it("should handle single line files", () => {
      const csv = "id,name,age"
      const bytes = new TextEncoder().encode(csv)
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffBytes(bytes)

      expect(metadata.numFields).toBe(3)
    })
  })

  describe("sniffRows", () => {
    it("should detect comma delimiter from rows with header", () => {
      const rows = [
        ["id", "name", "age"],
        [1, "Alice", 25],
        [2, "Bob", 30],
      ]
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffRows(rows)

      expect(metadata.dialect.delimiter).toBe(44)
      expect(metadata.dialect.header.hasHeaderRow).toBe(true)
      expect(metadata.fields).toEqual(["id", "name", "age"])
      expect(metadata.numFields).toBe(3)
    })

    it("should detect CSV without header", () => {
      const rows = [
        [1, "Alice", 25],
        [2, "Bob", 30],
        [3, "Charlie", 35],
      ]
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffRows(rows)

      expect(metadata.dialect.delimiter).toBe(44)
      expect(metadata.dialect.header.hasHeaderRow).toBe(false)
      expect(metadata.fields).toEqual(["field_1", "field_2", "field_3"])
    })

    it("should handle string values with commas (quoted)", () => {
      const rows = [
        ["name", "city"],
        ["Smith, John", "New York"],
        ["Doe, Jane", "Los Angeles"],
      ]
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffRows(rows)

      expect(metadata.dialect.delimiter).toBe(44)
      expect(metadata.fields).toEqual(["name", "city"])
    })

    it("should handle string values with quotes (escaped)", () => {
      const rows = [
        ["text", "author"],
        ['He said "Hello"', "Alice"],
        ['She said "Hi"', "Bob"],
      ]
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffRows(rows)

      expect(metadata.dialect.quote.type).toBe("Some")
      if (metadata.dialect.quote.type === "Some") {
        expect(metadata.dialect.quote.char).toBe(34)
      }
    })

    it("should convert null and undefined to empty strings", () => {
      const rows = [
        ["id", "name", "optional"],
        [1, "Alice", null],
        [2, "Bob", undefined],
      ]
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffRows(rows)

      expect(metadata.fields).toEqual(["id", "name", "optional"])
    })

    it("should convert numbers and booleans", () => {
      const rows = [
        ["count", "price", "active"],
        [42, 19.99, true],
        [100, 5.5, false],
      ]
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffRows(rows)

      expect(metadata.numFields).toBe(3)
    })

    it("should convert Date objects to ISO strings", () => {
      const rows = [
        ["event", "timestamp"],
        ["Login", new Date("2024-01-01T10:00:00Z")],
        ["Logout", new Date("2024-01-01T11:00:00Z")],
      ]
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffRows(rows)

      expect(metadata.fields).toEqual(["event", "timestamp"])
    })

    it("should handle objects and arrays via JSON.stringify", () => {
      const rows = [
        ["id", "metadata", "tags"],
        [1, { key: "value" }, ["a", "b"]],
        [2, { key: "other" }, ["c"]],
      ]
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffRows(rows)

      expect(metadata.numFields).toBe(3)
    })

    it("should handle rows with variable lengths (flexible mode)", () => {
      const rows = [["id", "name"], [1, "Alice"], [2, "Bob", "extra"], [3]]
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffRows(rows)

      expect(metadata.dialect.flexible).toBe(true)
    })

    it("should handle empty array", () => {
      const rows: unknown[][] = []
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffRows(rows)

      expect(metadata.numFields).toBe(0)
      expect(metadata.fields).toEqual([])
    })

    it("should handle array with single row", () => {
      const rows = [[1, "Alice"]]
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffRows(rows)

      expect(metadata.numFields).toBe(2)
    })

    it("should respect configured sample size", () => {
      const rows = Array.from({ length: 1000 }, (_, i) => [i, `data${i}`])
      const sniffer = new Sniffer().withSampleSize({
        type: "Records",
        count: 10,
      })
      const metadata = sniffer.sniffRows(rows)

      expect(metadata.numFields).toBe(2)
    })

    it("should handle preamble rows starting with # (from xlsx)", () => {
      const rows = [
        ["# Exported from Excel on 2024-01-01"],
        ["# Data source: Sales Report"],
        ["id", "product", "quantity"],
        [1, "Widget", 100],
        [2, "Gadget", 150],
      ]
      const sniffer = new Sniffer()
      const metadata = sniffer.sniffRows(rows)

      expect(metadata.dialect.header.numPreambleRows).toBe(2)
      expect(metadata.dialect.header.hasHeaderRow).toBe(true)
      expect(metadata.fields).toEqual(["id", "product", "quantity"])
      expect(metadata.numFields).toBe(3)
    })
  })
})
