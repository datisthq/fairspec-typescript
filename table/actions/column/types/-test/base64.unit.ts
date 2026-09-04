import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { normalizeTable } from "../../../../actions/table/normalize.ts"

describe("parseBase64Column", () => {
  it.each([
    ["SGVsbG8gV29ybGQ=", "SGVsbG8gV29ybGQ="],
    ["YWJjZGVm", "YWJjZGVm"],
    // ["", null],
    ["!!!invalid!!!", null],
    ["not base64", null],
  ])("%s -> %s", async (cell, expected) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "string",
          format: "base64",
        },
      },
    }

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()

    const actual = frame.toRecords()[0]?.name
    expect(actual).toEqual(expected)
  })
})
