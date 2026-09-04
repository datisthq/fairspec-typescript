import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { inspectTable } from "../../../../actions/table/inspect.ts"

describe("inspectTable (cell/minItems)", () => {
  it("should not error for list values that meet the minItems constraint", async () => {
    const table = pl
      .DataFrame({
        tags: ["a,b,c", "x,y,z", "1,2,3"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        tags: {
          type: "string",
          format: "list",
          minItems: 3,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should error for list values with fewer items than minItems", async () => {
    const table = pl
      .DataFrame({
        tags: ["a,b,c", "x", "1,2", "p,q,r,s"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        tags: {
          type: "string",
          format: "list",
          minItems: 3,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(
      errors.filter((e: { type: string }) => e.type === "cell/minItems"),
    ).toHaveLength(2)
    expect(errors).toContainEqual({
      type: "cell/minItems",
      columnName: "tags",
      minItems: 3,
      rowNumber: 2,
      cell: "x",
    })
    expect(errors).toContainEqual({
      type: "cell/minItems",
      columnName: "tags",
      minItems: 3,
      rowNumber: 3,
      cell: "1,2",
    })
  })

  it("should handle custom delimiter", async () => {
    const table = pl
      .DataFrame({
        tags: ["a;b;c", "x", "1;2"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        tags: {
          type: "string",
          format: "list",
          delimiter: ";",
          minItems: 2,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(
      errors.filter((e: { type: string }) => e.type === "cell/minItems"),
    ).toHaveLength(1)
    expect(errors).toContainEqual({
      type: "cell/minItems",
      columnName: "tags",
      minItems: 2,
      rowNumber: 2,
      cell: "x",
    })
  })

  it("should handle null values correctly", async () => {
    const table = pl
      .DataFrame({
        tags: ["a,b,c", null, "x,y,z"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        tags: {
          type: "string",
          format: "list",
          minItems: 3,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(
      errors.filter((e: { type: string }) => e.type === "cell/minItems"),
    ).toHaveLength(0)
  })

  it("should handle minItems of 1", async () => {
    const table = pl
      .DataFrame({
        tags: ["a", "", "b,c"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        tags: {
          type: "string",
          format: "list",
          minItems: 1,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(
      errors.filter((e: { type: string }) => e.type === "cell/minItems"),
    ).toHaveLength(0)
  })
})
