import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { inspectTable } from "../../../actions/table/inspect.ts"
import { normalizeTable } from "../../../actions/table/normalize.ts"

describe("narrowColumn", () => {
  describe("narrow to integer", () => {
    it("should narrow float to integer", async () => {
      const table = pl
        .DataFrame({
          id: [1.0, 2.0, 3.0],
          name: ["a", "b", "c"],
        })
        .lazy()

      const tableSchema: TableSchema = {
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
        },
      }

      const result = await normalizeTable(table, tableSchema)
      const frame = await result.collect()

      expect(frame.toRecords()).toEqual([
        { id: 1, name: "a" },
        { id: 2, name: "b" },
        { id: 3, name: "c" },
      ])
    })

    it("should detect error when float cannot be narrowed to integer", async () => {
      const table = pl
        .DataFrame({
          id: [1.0, 2.0, 3.5],
          name: ["a", "b", "c"],
        })
        .lazy()

      const tableSchema: TableSchema = {
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
        },
      }

      const errors = await inspectTable(table, { tableSchema })

      expect(errors).toEqual([
        {
          type: "cell/type",
          columnName: "id",
          columnType: "integer",
          rowNumber: 3,
          cell: "3.5",
        },
      ])
    })
  })

  describe("narrow to categorical", () => {
    it.each([
      ["red", "red"],
      ["green", "green"],
      ["yellow", null],
    ])("string: %s -> %s", async (cell, expected) => {
      const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
      const tableSchema: TableSchema = {
        properties: {
          name: {
            type: "string",
            format: "categorical",
            categories: ["red", "green", "blue"],
          },
        },
      }

      const result = await normalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.toRecords()[0]?.name
      expect(actual).toEqual(expected)
    })

    it.each([
      [1, "Low"],
      [2, "High"],
      [3, null],
    ])("integer: %s -> %s", async (cell, expected) => {
      const table = pl.DataFrame([pl.Series("name", [cell], pl.Int64)]).lazy()
      const tableSchema: TableSchema = {
        properties: {
          name: {
            type: "integer",
            format: "categorical",
            categories: [
              { value: 1, label: "Low" },
              { value: 2, label: "High" },
            ],
          },
        },
      }

      const result = await normalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.toRecords()[0]?.name
      expect(actual).toEqual(expected)
    })
  })
})
