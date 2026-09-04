import { describe, expect, it } from "vite-plus/test"
import type { PotentialDialect } from "../potentialDialects.ts"
import { Table } from "../table.ts"

describe("Table", () => {
  it("should parse comma-delimited CSV", () => {
    const csv = "a,b,c\n1,2,3\n4,5,6"
    const bytes = new TextEncoder().encode(csv)
    const dialect: PotentialDialect = {
      delimiter: 44,
      quote: { type: "None" },
      lineTerminator: "LF",
    }

    const table = Table.parse(bytes, dialect)

    expect(table.rows).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
      ["4", "5", "6"],
    ])
    expect(table.fieldCounts).toEqual([3, 3, 3])
  })

  it("should parse quoted fields", () => {
    const csv = 'a,"b,c",d\n1,"2,3",4'
    const bytes = new TextEncoder().encode(csv)
    const dialect: PotentialDialect = {
      delimiter: 44,
      quote: { type: "Some", char: 34 },
      lineTerminator: "LF",
    }

    const table = Table.parse(bytes, dialect)

    expect(table.rows).toEqual([
      ["a", "b,c", "d"],
      ["1", "2,3", "4"],
    ])
  })

  it("should handle escaped quotes", () => {
    const csv = 'a,"b""c",d'
    const bytes = new TextEncoder().encode(csv)
    const dialect: PotentialDialect = {
      delimiter: 44,
      quote: { type: "Some", char: 34 },
      lineTerminator: "LF",
    }

    const table = Table.parse(bytes, dialect)

    expect(table.rows).toEqual([["a", 'b"c', "d"]])
  })

  it("should calculate modal field count", () => {
    const rows = [
      ["a", "b", "c"],
      ["1", "2", "3"],
      ["4", "5"],
      ["7", "8", "9"],
    ]
    const fieldCounts = [3, 3, 2, 3]
    const table = new Table(rows, fieldCounts)

    expect(table.getModalFieldCount()).toBe(3)
  })

  it("should cache modal field count", () => {
    const rows = [
      ["a", "b"],
      ["1", "2"],
    ]
    const fieldCounts = [2, 2]
    const table = new Table(rows, fieldCounts)

    const first = table.getModalFieldCount()
    const second = table.getModalFieldCount()

    expect(first).toBe(second)
    expect(first).toBe(2)
  })

  it("should detect uniform tables", () => {
    const rows = [
      ["a", "b"],
      ["1", "2"],
      ["3", "4"],
    ]
    const fieldCounts = [2, 2, 2]
    const table = new Table(rows, fieldCounts)

    expect(table.isUniform()).toBe(true)
  })

  it("should detect non-uniform tables", () => {
    const rows = [
      ["a", "b"],
      ["1", "2", "3"],
      ["4", "5"],
    ]
    const fieldCounts = [2, 3, 2]
    const table = new Table(rows, fieldCounts)

    expect(table.isUniform()).toBe(false)
  })

  it("should return number of rows", () => {
    const rows = [["a"], ["b"], ["c"]]
    const fieldCounts = [1, 1, 1]
    const table = new Table(rows, fieldCounts)

    expect(table.numRows()).toBe(3)
  })

  it("should handle empty table", () => {
    const table = new Table([], [])

    expect(table.numRows()).toBe(0)
    expect(table.getModalFieldCount()).toBe(0)
    expect(table.isUniform()).toBe(true)
  })

  it("should parse CRLF line terminators", () => {
    const csv = "a,b\r\n1,2\r\n3,4"
    const bytes = new TextEncoder().encode(csv)
    const dialect: PotentialDialect = {
      delimiter: 44,
      quote: { type: "None" },
      lineTerminator: "CRLF",
    }

    const table = Table.parse(bytes, dialect)

    expect(table.rows.length).toBe(3)
  })

  it("should parse CR line terminators", () => {
    const csv = "a,b\r1,2\r3,4"
    const bytes = new TextEncoder().encode(csv)
    const dialect: PotentialDialect = {
      delimiter: 44,
      quote: { type: "None" },
      lineTerminator: "CR",
    }

    const table = Table.parse(bytes, dialect)

    expect(table.rows.length).toBe(3)
  })

  it("should handle modal field count optimization for wide tables", () => {
    const rows = Array.from({ length: 300 }, (_, i) =>
      Array.from({ length: i % 2 === 0 ? 260 : 250 }, () => "x"),
    )
    const fieldCounts = rows.map(row => row.length)
    const table = new Table(rows, fieldCounts)

    expect(table.getModalFieldCount()).toBe(260)
  })
})
