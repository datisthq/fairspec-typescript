import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { denormalizeTable } from "../../../../actions/table/denormalize.ts"
import { normalizeTable } from "../../../../actions/table/normalize.ts"

describe("parseTimeColumn", () => {
  it.each([
    ["06:00:00", "06:00:00"],
    ["09:00", null],
    ["3 am", null],
    ["3.00", null],
    ["invalid", null],
    ["", null],
  ])("default: %s -> %s", async (cell, expected) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "string",
          format: "time",
        },
      },
    }

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })

  it.each([
    ["06:00", "06:00:00"],
    ["06:50", "06:50:00"],
    ["3:00 am", "03:00:00"],
    ["some night", null],
    ["invalid", null],
    ["", null],
  ])("temporalFormat: %s -> %s", async (cell, expected) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "string",
          format: "time",
          temporalFormat: "%H:%M",
        },
      },
    }

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })
})

describe("stringifyTimeColumn", () => {
  it.each([
    [new Date(Date.UTC(2014, 0, 1, 6, 0, 0)), "06:00:00"],
    [new Date(Date.UTC(2014, 0, 1, 16, 30, 0)), "16:30:00"],
  ])("default: %s -> %s", async (value, expected) => {
    const table = pl.DataFrame([pl.Series("name", [value], pl.Time)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "string",
          format: "time",
        },
      },
    }

    const result = await denormalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })

  it.each([
    [new Date(Date.UTC(2014, 0, 1, 6, 0, 0)), "06:00"],
    [new Date(Date.UTC(2014, 0, 1, 16, 30, 0)), "16:30"],
  ])("temporalFormat: %s -> %s", async (value, expected) => {
    const table = pl.DataFrame([pl.Series("name", [value], pl.Time)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "string",
          format: "time",
          temporalFormat: "%H:%M",
        },
      },
    }

    const result = await denormalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })
})
