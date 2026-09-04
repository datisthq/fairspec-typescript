import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { denormalizeTable } from "../../../../actions/table/denormalize.ts"

describe("stringifyUnknownColumn", () => {
  it.each([
    [1.0, "1.0"],
    [3.14, "3.14"],
    [true, "true"],
    [false, "false"],
    ["text", "text"],
    // TODO: Review
    // [null, ""],
  ])("%s -> %s", async (value, expected) => {
    const table = pl.DataFrame([pl.Series("name", [value])]).lazy()

    const tableSchema: TableSchema = {
      properties: {
        name: {
          title: "Name",
        },
      },
    }

    const result = await denormalizeTable(table, tableSchema)
    const frame = await result.collect()

    expect(frame.toRecords()[0]?.name).toEqual(expected)
  })
})
