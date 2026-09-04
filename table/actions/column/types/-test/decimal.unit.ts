import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { denormalizeTable } from "../../../../actions/table/denormalize.ts"
import { normalizeTable } from "../../../../actions/table/normalize.ts"

describe("parseDecimalColumn", () => {
  it.each([
    ["1", 1.0],
    ["2", 2.0],
    ["1000", 1000.0],
    ["1.5", 1.5],
    ["4.14159", 4.14159],
    ["-42", -42.0],
    ["-3.14", -3.14],
    ["", null],
    ["bad", null],
    ["text", null],
  ])("default: %s -> %s", async (cell, expected) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "number",
        },
      },
    }

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })

  it.each([
    ["1", 1.0],
    ["1,000", 1000.0],
    ["1,000,000", 1000000.0],
    ["1,234.56", 1234.56],
  ])("groupChar ',': %s -> %s", async (cell, expected) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "number",
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
    ["1,5", 1.5],
    ["3,14", 3.14],
  ])("decimalChar ',': %s -> %s", async (cell, expected) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "number",
          decimalChar: ",",
        },
      },
    }

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })

  it.each([
    ["1.234,56", 1234.56],
    ["1.000,00", 1000.0],
  ])("groupChar '.' + decimalChar ',': %s -> %s", async (cell, expected) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "number",
          groupChar: ".",
          decimalChar: ",",
        },
      },
    }

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })

  it.each([
    ["$1.5", 1.5],
    ["1.5%", 1.5],
    ["€1000", 1000.0],
    ["1000€", 1000.0],
  ])("withText: %s -> %s", async (cell, expected) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "number",
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
    ["$1,000.00", 1000.0],
    ["1,234.56$", 1234.56],
  ])("withText + groupChar: %s -> %s", async (cell, expected) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "number",
          withText: true,
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
    ["€ 1.000,00", 1000.0],
    ["1.000,00 €", 1000.0],
    ["1.234,56 €", 1234.56],
  ])("withText + groupChar '.' + decimalChar ',': %s -> %s", async (cell, expected) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "number",
          withText: true,
          groupChar: ".",
          decimalChar: ",",
        },
      },
    }

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })
})

// TODO: how to construct it properly in polars?
describe.skip("stringifyDecimalColumn", () => {
  it.each([
    [1.0, "1.0"],
    [2.0, "2.0"],
    [1000.0, "1000.0"],
    [3.14, "3.14"],
    [42.5, "42.5"],
    [-1.0, "-1.0"],
    [-100.5, "-100.5"],
    [0.0, "0.0"],
    [-123.456789, "-123.456789"],
    [1234567890.123, "1234567890.123"],
    [-9876543210.987, "-9876543210.987"],
    [0.001, "0.001"],
    [-0.0001, "-0.0001"],
    // [null, ""],
  ])("default: %s -> %s", async (value, expected) => {
    const table = pl.DataFrame([pl.Series("name", [value], pl.Decimal())]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "number",
        },
      },
    }

    const result = await denormalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })
})
