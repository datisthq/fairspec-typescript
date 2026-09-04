import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { normalizeTable } from "../../../../actions/table/normalize.ts"

describe("parseHexColumn", () => {
  it.each([
    ["0123456789abcdef", "0123456789abcdef"],
    ["ABCDEF", "ABCDEF"],
    ["deadbeef", "deadbeef"],
    // ["", null],
    ["ghijkl", null],
    ["0x1234", null],
    ["hello world", null],
  ])("%s -> %s", async (cell, expected) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "string",
          format: "hex",
        },
      },
    }

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })
})
