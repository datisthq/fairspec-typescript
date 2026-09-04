import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { normalizeTable } from "../../../actions/table/normalize.ts"

describe("substituteColumn", () => {
  describe("string missing values", () => {
    it.each([
      ["-", "-"],
      ["", ""],
      ["x", null],
      ["value", "value"],
    ])('schema-level ["x"]: %s -> %s', async (cell, expected) => {
      const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
      const tableSchema: TableSchema = {
        missingValues: ["x"],
        properties: {
          name: { type: "string" },
        },
      }

      const result = await normalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.getColumn("name").get(0)
      expect(actual).toEqual(expected)
    })

    it.each([
      ["-", null],
      ["", ""],
      ["x", "x"],
      ["value", "value"],
    ])('column-level ["-"]: %s -> %s', async (cell, expected) => {
      const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
      const tableSchema: TableSchema = {
        properties: {
          name: { type: "string", missingValues: ["-"] },
        },
      }

      const result = await normalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.getColumn("name").get(0)
      expect(actual).toEqual(expected)
    })

    it.each([
      ["", null],
      ["-", "-"],
      ["x", "x"],
      ["value", "value"],
    ])('column-level [""]: %s -> %s', async (cell, expected) => {
      const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
      const tableSchema: TableSchema = {
        properties: {
          name: { type: "string", missingValues: [""] },
        },
      }

      const result = await normalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.getColumn("name").get(0)
      expect(actual).toEqual(expected)
    })

    it.each([
      ["n/a", null],
      ["-", "-"],
      ["", ""],
      ["value", "value"],
    ])('column-level ["n/a"]: %s -> %s', async (cell, expected) => {
      const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
      const tableSchema: TableSchema = {
        properties: {
          name: { type: "string", missingValues: ["n/a"] },
        },
      }

      const result = await normalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.getColumn("name").get(0)
      expect(actual).toEqual(expected)
    })

    it.each([
      ["-", null],
      ["x", null],
      ["", ""],
      ["value", "value"],
    ])('schema-level ["x"] + column-level ["-"]: %s -> %s', async (cell, expected) => {
      const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
      const tableSchema: TableSchema = {
        missingValues: ["x"],
        properties: {
          name: { type: "string", missingValues: ["-"] },
        },
      }

      const result = await normalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.getColumn("name").get(0)
      expect(actual).toEqual(expected)
    })

    it.each([
      ["-", null],
      ["x", null],
      ["", ""],
      ["value", "value"],
    ])('schema-level ["-"] + column-level ["x"]: %s -> %s', async (cell, expected) => {
      const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
      const tableSchema: TableSchema = {
        missingValues: ["-"],
        properties: {
          name: { type: "string", missingValues: ["x"] },
        },
      }

      const result = await normalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.getColumn("name").get(0)
      expect(actual).toEqual(expected)
    })
  })

  describe("integer missing values", () => {
    it.each([
      [-1, null],
      [0, 0],
      [1, 1],
      [42, 42],
    ])("schema-level [-1]: %s -> %s", async (value, expected) => {
      const table = pl.DataFrame([pl.Series("value", [value], pl.Int64)]).lazy()
      const tableSchema: TableSchema = {
        missingValues: [-1],
        properties: {
          value: { type: "integer" },
        },
      }

      const result = await normalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.getColumn("value").get(0)
      expect(actual).toEqual(expected)
    })

    it.each([
      [-999, null],
      [0, 0],
      [1, 1],
      [100, 100],
    ])("schema-level [-999]: %s -> %s", async (value, expected) => {
      const table = pl.DataFrame([pl.Series("value", [value], pl.Int64)]).lazy()
      const tableSchema: TableSchema = {
        missingValues: [-999],
        properties: {
          value: { type: "integer" },
        },
      }

      const result = await normalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.getColumn("value").get(0)
      expect(actual).toEqual(expected)
    })

    it.each([
      [-1, null],
      [0, 0],
      [5, 5],
      [999, 999],
    ])("column-level [-1]: %s -> %s", async (value, expected) => {
      const table = pl.DataFrame([pl.Series("value", [value], pl.Int64)]).lazy()
      const tableSchema: TableSchema = {
        properties: {
          value: { type: "integer", missingValues: [-1] },
        },
      }

      const result = await normalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.getColumn("value").get(0)
      expect(actual).toEqual(expected)
    })

    it.each([
      [-999, null],
      [0, 0],
      [7, 7],
      [123, 123],
    ])("column-level [-999]: %s -> %s", async (value, expected) => {
      const table = pl.DataFrame([pl.Series("value", [value], pl.Int64)]).lazy()
      const tableSchema: TableSchema = {
        properties: {
          value: { type: "integer", missingValues: [-999] },
        },
      }

      const result = await normalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.getColumn("value").get(0)
      expect(actual).toEqual(expected)
    })

    it.each([
      [-1, null],
      [-99, null],
      [0, 0],
      [42, 42],
    ])("schema-level [-99] + column-level [-1]: %s -> %s", async (value, expected) => {
      const table = pl.DataFrame([pl.Series("value", [value], pl.Int64)]).lazy()
      const tableSchema: TableSchema = {
        missingValues: [-99],
        properties: {
          value: { type: "integer", missingValues: [-1] },
        },
      }

      const result = await normalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.getColumn("value").get(0)
      expect(actual).toEqual(expected)
    })

    it.each([
      [-1, null],
      [-99, null],
      [0, 0],
      [99, 99],
    ])("schema-level [-1] + column-level [-99]: %s -> %s", async (value, expected) => {
      const table = pl.DataFrame([pl.Series("value", [value], pl.Int64)]).lazy()
      const tableSchema: TableSchema = {
        missingValues: [-1],
        properties: {
          value: { type: "integer", missingValues: [-99] },
        },
      }

      const result = await normalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.getColumn("value").get(0)
      expect(actual).toEqual(expected)
    })

    it.each([
      [-1, null],
      [0, 0],
      [1, 1],
      [42, 42],
    ])("schema-level [-1] (Float64): %s -> %s", async (value, expected) => {
      const table = pl.DataFrame([pl.Series("value", [value], pl.Float64)]).lazy()
      const tableSchema: TableSchema = {
        missingValues: [-1],
        properties: {
          value: { type: "integer" },
        },
      }

      const result = await normalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.getColumn("value").get(0)
      expect(actual).toEqual(expected)
    })

    it.each([
      [-999, null],
      [0, 0],
      [1, 1],
      [100, 100],
    ])("schema-level [-999] (Float64): %s -> %s", async (value, expected) => {
      const table = pl.DataFrame([pl.Series("value", [value], pl.Float64)]).lazy()
      const tableSchema: TableSchema = {
        missingValues: [-999],
        properties: {
          value: { type: "integer" },
        },
      }

      const result = await normalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.getColumn("value").get(0)
      expect(actual).toEqual(expected)
    })

    it.each([
      [-1, null],
      [0, 0],
      [5, 5],
      [999, 999],
    ])("column-level [-1] (Float64): %s -> %s", async (value, expected) => {
      const table = pl.DataFrame([pl.Series("value", [value], pl.Float64)]).lazy()
      const tableSchema: TableSchema = {
        properties: {
          value: { type: "integer", missingValues: [-1] },
        },
      }

      const result = await normalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.getColumn("value").get(0)
      expect(actual).toEqual(expected)
    })

    it.each([
      [-999, null],
      [0, 0],
      [7, 7],
      [123, 123],
    ])("column-level [-999] (Float64): %s -> %s", async (value, expected) => {
      const table = pl.DataFrame([pl.Series("value", [value], pl.Float64)]).lazy()
      const tableSchema: TableSchema = {
        properties: {
          value: { type: "integer", missingValues: [-999] },
        },
      }

      const result = await normalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.getColumn("value").get(0)
      expect(actual).toEqual(expected)
    })

    it.each([
      [-1, null],
      [-99, null],
      [0, 0],
      [42, 42],
    ])(
      "schema-level [-99] + column-level [-1] (Float64): %s -> %s",
      async (value, expected) => {
        const table = pl.DataFrame([pl.Series("value", [value], pl.Float64)]).lazy()
        const tableSchema: TableSchema = {
          missingValues: [-99],
          properties: {
            value: { type: "integer", missingValues: [-1] },
          },
        }

        const result = await normalizeTable(table, tableSchema)
        const frame = await result.collect()

        const actual = frame.getColumn("value").get(0)
        expect(actual).toEqual(expected)
      },
    )

    it.each([
      [-1, null],
      [-99, null],
      [0, 0],
      [99, 99],
    ])(
      "schema-level [-1] + column-level [-99] (Float64): %s -> %s",
      async (value, expected) => {
        const table = pl.DataFrame([pl.Series("value", [value], pl.Float64)]).lazy()
        const tableSchema: TableSchema = {
          missingValues: [-1],
          properties: {
            value: { type: "integer", missingValues: [-99] },
          },
        }

        const result = await normalizeTable(table, tableSchema)
        const frame = await result.collect()

        const actual = frame.getColumn("value").get(0)
        expect(actual).toEqual(expected)
      },
    )
  })
})
