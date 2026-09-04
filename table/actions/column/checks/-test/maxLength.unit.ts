import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { inspectTable } from "../../../../actions/table/inspect.ts"

describe("inspectTable (cell/maxLength)", () => {
  it("should not errors for string values that meet the maxLength constraint", async () => {
    const table = pl
      .DataFrame({
        code: ["A123", "B456", "C789"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        code: {
          type: "string",
          maxLength: 4,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should report an error for strings that are too long", async () => {
    const table = pl
      .DataFrame({
        username: ["bob", "alice", "christopher", "david"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        username: {
          type: "string",
          maxLength: 8,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(
      errors.filter((e: { type: string }) => e.type === "cell/maxLength"),
    ).toHaveLength(1)
    expect(errors).toContainEqual({
      type: "cell/maxLength",
      columnName: "username",
      maxLength: 8,
      rowNumber: 3,
      cell: "christopher",
    })
  })
})
