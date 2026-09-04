import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { normalizeTable } from "../../../../actions/table/normalize.ts"

describe("parseEmailColumn", () => {
  it.each([
    ["user@example.com", "user@example.com"],
    ["test.name@domain.org", "test.name@domain.org"],
    ["user+tag@example.co.uk", "user+tag@example.co.uk"],
    ["", null],
    ["invalid", null],
    ["@example.com", null],
    ["user@", null],
    ["user example.com", null],
  ])("%s -> %s", async (cell, expected) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "string",
          format: "email",
        },
      },
    }

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })
})
