import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { denormalizeTable } from "../../../actions/table/denormalize.ts"

describe("denarrowColumn", () => {
  describe("denarrow to categorical", () => {
    it.each([
      ["red", "red"],
      ["green", "green"],
    ])("string: %s -> %s", async (value, expected) => {
      const table = pl.DataFrame([pl.Series("name", [value], pl.Categorical)]).lazy()
      const tableSchema: TableSchema = {
        properties: {
          name: {
            type: "string",
            format: "categorical",
            categories: ["red", "green", "blue"],
          },
        },
      }

      const result = await denormalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.toRecords()[0]?.name
      expect(actual).toEqual(expected)
    })

    it.each([
      ["Low", 1],
      ["High", 2],
    ])("integer: %s -> %s", async (value, expected) => {
      const table = pl.DataFrame([pl.Series("name", [value], pl.Categorical)]).lazy()
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

      const result = await denormalizeTable(table, tableSchema, {
        nativeTypes: ["integer"],
      })

      const frame = await result.collect()
      const actual = frame.toRecords()[0]?.name
      expect(actual).toEqual(expected)
    })
  })
})
