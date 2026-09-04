import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { inspectTable } from "../../../../actions/table/inspect.ts"

describe("parseWkbColumn", () => {
  it.each([
    ["0101000000000000000000f03f0000000000000040", true],
    ["ghijkl", false],
    ["0x1234", false],
    ["hello world", false],
  ])("%s -> %s", async (cell, valid) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "string",
          format: "wkb",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(!errors.length).toEqual(valid)
  })
})
