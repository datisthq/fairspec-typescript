import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { denormalizeTable } from "../../../../actions/table/denormalize.ts"
import { normalizeTable } from "../../../../actions/table/normalize.ts"

describe("parseIntegerColumn", () => {
  it.each([
    ["1", 1],
    ["2", 2],
    ["1000", 1000],
    ["0", 0],
    ["00", 0],
    ["01", 1],
    ["000835", 835],
    ["", null],
    ["2.1", null],
    ["bad", null],
    ["0.0003", null],
    ["3.14", null],
    ["1/2", null],
  ])("default: %s -> %s", async (cell, expected) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "integer",
        },
      },
    }

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })

  it.each([
    ["1", 1],
    ["1,000", 1000],
    ["1,000,000", 1000000],
    ["000,001", 1],
  ])("groupChar ',': %s -> %s", async (cell, expected) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "integer",
          groupChar: ",",
        },
      },
    }

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })

  it.each([
    ["1 000", 1000],
    ["1'000'000", 1000000],
    ["1.000.000", 1000000],
  ])("groupChar other: %s -> %s", async (cell, expected) => {
    const groupChar = cell.includes(" ") ? " " : cell.includes("'") ? "'" : "."
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "integer",
          groupChar,
        },
      },
    }

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })

  it.each([
    ["1", 1],
    ["1000", 1000],
    ["$1000", 1000],
    ["1000$", 1000],
    ["€1000", 1000],
    ["1000€", 1000],
    ["-12€", -12],
    ["€-12", -12],
    ["1,000", null],
  ])("bareNumber false: %s -> %s", async (cell, expected) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "integer",
          withText: true,
        },
      },
    }

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })

  it.each([
    ["$1,000,000", 1000000],
    ["1,000,000$", 1000000],
  ])("bareNumber false + groupChar: %s -> %s", async (cell, expected) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "integer",
          groupChar: ",",
          withText: true,
        },
      },
    }

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })
})

describe("stringifyIntegerColumn", () => {
  it.each([
    [1, "1"],
    [2, "2"],
    [1000, "1000"],
    [42, "42"],
    [-1, "-1"],
    [-100, "-100"],
    [0, "0"],
    [1234567890, "1234567890"],
    [-1234567890, "-1234567890"],
    // [null, ""],
  ])("default: %s -> %s", async (value, expected) => {
    const table = pl.DataFrame([pl.Series("name", [value], pl.Int64)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "integer",
        },
      },
    }

    const result = await denormalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })
})
