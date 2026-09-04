import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { inspectTable } from "../../../../actions/table/inspect.ts"

describe("inspectTable (cell/pattern)", () => {
  it("should not errors for string values that match the pattern", async () => {
    const table = pl
      .DataFrame({
        email: ["john@example.com", "alice@domain.org", "test@test.io"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        email: {
          type: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should report an error for strings that don't match the pattern", async () => {
    const pattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"

    const table = pl
      .DataFrame({
        email: ["john@example.com", "alice@domain", "test.io", "valid@email.com"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        email: {
          type: "string",
          pattern,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(
      errors.filter((e: { type: string }) => e.type === "cell/pattern"),
    ).toHaveLength(2)
    expect(errors).toContainEqual({
      type: "cell/pattern",
      columnName: "email",
      pattern,
      rowNumber: 2,
      cell: "alice@domain",
    })
    expect(errors).toContainEqual({
      type: "cell/pattern",
      columnName: "email",
      pattern,
      rowNumber: 3,
      cell: "test.io",
    })
  })

  // TODO: recover polars panic
  it.skip("should not error for valid decimal values", async () => {
    const table = pl
      .DataFrame([pl.Series("amount", ["100.00", "200.00", "300.00"], pl.String)])
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        amount: {
          type: "string",
          format: "decimal",
          pattern: "^\\d{3}\\.\\d{2}$",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })
})
