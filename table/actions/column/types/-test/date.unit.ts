import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { denormalizeTable } from "../../../../actions/table/denormalize.ts"
import { normalizeTable } from "../../../../actions/table/normalize.ts"

describe("parseDateColumn", () => {
  it.each([
    ["2019-01-01", new Date(Date.UTC(2019, 0, 1))],
    ["10th Jan 1969", null],
    ["invalid", null],
    ["", null],
  ])("default: %s -> %s", async (cell, expected) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "string",
          format: "date",
        },
      },
    }

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })

  it.each([
    ["21/11/2006", new Date(Date.UTC(2006, 10, 21))],
    ["invalid", null],
    ["", null],
  ])("temporalFormat %%d/%%m/%%Y: %s -> %s", async (cell, expected) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "string",
          format: "date",
          temporalFormat: "%d/%m/%Y",
        },
      },
    }

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })

  it.each([
    ["21/11/06 16:30", new Date(Date.UTC(2006, 10, 21))],
    ["invalid", null],
    ["", null],
  ])("temporalFormat %%d/%%m/%%y: %s -> %s", async (cell, expected) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "string",
          format: "date",
          temporalFormat: "%d/%m/%y",
        },
      },
    }

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })

  it.each([["2006/11/21", new Date(Date.UTC(2006, 10, 21))]])(
    "temporalFormat %%Y/%%m/%%d: %s -> %s",
    async (cell, expected) => {
      const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
      const tableSchema: TableSchema = {
        properties: {
          name: {
            type: "string",
            format: "date",
            temporalFormat: "%Y/%m/%d",
          },
        },
      }

      const result = await normalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.toRecords()[0]?.name
      expect(actual).toEqual(expected)
    },
  )

  it.each([["21/11/06", null]])(
    "invalid temporalFormat: %s -> %s",
    async (cell, expected) => {
      const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
      const tableSchema: TableSchema = {
        properties: {
          name: {
            type: "string",
            format: "date",
            temporalFormat: "invalid",
          },
        },
      }

      const result = await normalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.toRecords()[0]?.name
      expect(actual).toEqual(expected)
    },
  )
})

describe("stringifyDateColumn", () => {
  it.each([
    [new Date(Date.UTC(2019, 0, 1)), "2019-01-01"],
    [new Date(Date.UTC(2006, 10, 21)), "2006-11-21"],
  ])("default: %s -> %s", async (value, expected) => {
    const table = pl.DataFrame([pl.Series("name", [value], pl.Date)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "string",
          format: "date",
        },
      },
    }

    const result = await denormalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })

  it.each([[new Date(Date.UTC(2006, 10, 21)), "21/11/2006"]])(
    "temporalFormat %%d/%%m/%%Y: %s -> %s",
    async (value, expected) => {
      const table = pl.DataFrame([pl.Series("name", [value], pl.Date)]).lazy()
      const tableSchema: TableSchema = {
        properties: {
          name: {
            type: "string",
            format: "date",
            temporalFormat: "%d/%m/%Y",
          },
        },
      }

      const result = await denormalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.toRecords()[0]?.name
      expect(actual).toEqual(expected)
    },
  )

  it.each([[new Date(Date.UTC(2006, 10, 21)), "2006/11/21"]])(
    "temporalFormat %%Y/%%m/%%d: %s -> %s",
    async (value, expected) => {
      const table = pl.DataFrame([pl.Series("name", [value], pl.Date)]).lazy()
      const tableSchema: TableSchema = {
        properties: {
          name: {
            type: "string",
            format: "date",
            temporalFormat: "%Y/%m/%d",
          },
        },
      }

      const result = await denormalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.toRecords()[0]?.name
      expect(actual).toEqual(expected)
    },
  )
})
