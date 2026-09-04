import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { inspectTable } from "../../../../actions/table/inspect.ts"

describe("parseWktColumn", () => {
  it.each([
    ["POINT (0 0)", true],
    ["MULTIPOINT ((0 0), (1 1))", true],
    ["ghijkl", false],
    ["0x1234", false],
    ["hello world", false],
  ])("%s -> %s", async (cell, valid) => {
    const table = pl.DataFrame([pl.Series("name", [cell], pl.String)]).lazy()
    const tableSchema: TableSchema = {
      properties: {
        name: {
          type: "string",
          format: "wkt",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(!errors.length).toEqual(valid)
  })
})
