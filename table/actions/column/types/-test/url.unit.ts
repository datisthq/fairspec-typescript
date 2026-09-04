import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { normalizeTable } from "../../../../actions/table/normalize.ts"

describe("parseUrlColumn", () => {
  it.each([
    ["https://example.com", "https://example.com"],
    ["http://example.com", "http://example.com"],
    ["https://example.com/path?query=1", "https://example.com/path?query=1"],
    ["", null],
    ["example.com", null],
    ["ftp://example.com", null],
    ["not a url", null],
  ])("%s -> %s", async (cell, expected) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "string",
          format: "url",
        },
      },
    }

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })
})
