import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { denormalizeTable } from "../../../../actions/table/denormalize.ts"
import { normalizeTable } from "../../../../actions/table/normalize.ts"

describe("parseBooleanColumn", () => {
  it.each([
    ["true", true],
    ["True", true],
    ["TRUE", true],
    ["1", true],
    ["false", false],
    ["False", false],
    ["FALSE", false],
    ["0", false],
    ["", null],
    ["invalid", null],
    ["truthy", null],
    ["falsy", null],
    ["2", null],
    ["-100", null],
    ["t", null],
    ["f", null],
    ["3.14", null],
  ])("default: %s -> %s", async (cell, expected) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "boolean",
        },
      },
    }

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })

  it.each([
    ["Y", true],
    ["y", true],
    ["yes", true],
    ["true", null],
  ])("trueValues: %s -> %s", async (cell, expected) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "boolean",
          trueValues: ["Y", "y", "yes"],
        },
      },
    }

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })

  it.each([
    ["N", false],
    ["n", false],
    ["no", false],
    ["false", null],
  ])("falseValues: %s -> %s", async (cell, expected) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "boolean",
          falseValues: ["N", "n", "no"],
        },
      },
    }

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })

  it.each([
    ["oui", true],
    ["si", true],
    ["non", false],
    ["no", false],
  ])("trueValues + falseValues: %s -> %s", async (cell, expected) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "boolean",
          trueValues: ["oui", "si"],
          falseValues: ["non", "no"],
        },
      },
    }

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })
})

describe("stringifyBooleanColumn", () => {
  it.each([
    [true, "true"],
    [false, "false"],
  ])("default: %s -> %s", async (value, expected) => {
    const table = pl.DataFrame([pl.Series("name", [value], pl.Bool)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "boolean",
        },
      },
    }

    const result = await denormalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })

  it.each([
    [true, "Y"],
    [false, "false"],
  ])("trueValues: %s -> %s", async (value, expected) => {
    const table = pl.DataFrame([pl.Series("name", [value], pl.Bool)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "boolean",
          trueValues: ["Y", "y", "yes"],
        },
      },
    }

    const result = await denormalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })

  it.each([
    [true, "true"],
    [false, "N"],
  ])("falseValues: %s -> %s", async (value, expected) => {
    const table = pl.DataFrame([pl.Series("name", [value], pl.Bool)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "boolean",
          falseValues: ["N", "n", "no"],
        },
      },
    }

    const result = await denormalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })

  it.each([
    [true, "oui"],
    [false, "non"],
  ])("trueValues + falseValues: %s -> %s", async (value, expected) => {
    const table = pl.DataFrame([pl.Series("name", [value], pl.Bool)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "boolean",
          trueValues: ["oui", "si"],
          falseValues: ["non", "no"],
        },
      },
    }

    const result = await denormalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })
})
