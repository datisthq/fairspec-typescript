import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { inspectTable } from "../../../../actions/table/inspect.ts"

describe("inspectTable (cell/maxItems)", () => {
  it("should not error for list values that meet the maxItems constraint", async () => {
    const table = pl
      .DataFrame({
        tags: ["a,b", "x,y,z", "1"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        tags: {
          type: "string",
          format: "list",
          maxItems: 3,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should error for list values with more items than maxItems", async () => {
    const table = pl
      .DataFrame({
        tags: ["a,b", "x,y,z,w", "1,2,3,4,5", "p,q"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        tags: {
          type: "string",
          format: "list",
          maxItems: 3,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(
      errors.filter((e: { type: string }) => e.type === "cell/maxItems"),
    ).toHaveLength(2)
    expect(errors).toContainEqual({
      type: "cell/maxItems",
      columnName: "tags",
      maxItems: 3,
      rowNumber: 2,
      cell: "x,y,z,w",
    })
    expect(errors).toContainEqual({
      type: "cell/maxItems",
      columnName: "tags",
      maxItems: 3,
      rowNumber: 3,
      cell: "1,2,3,4,5",
    })
  })

  it("should handle custom delimiter", async () => {
    const table = pl
      .DataFrame({
        tags: ["a;b", "x;y;z;w", "1"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        tags: {
          type: "string",
          format: "list",
          delimiter: ";",
          maxItems: 2,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(
      errors.filter((e: { type: string }) => e.type === "cell/maxItems"),
    ).toHaveLength(1)
    expect(errors).toContainEqual({
      type: "cell/maxItems",
      columnName: "tags",
      maxItems: 2,
      rowNumber: 2,
      cell: "x;y;z;w",
    })
  })

  it("should handle null values correctly", async () => {
    const table = pl
      .DataFrame({
        tags: ["a,b", null, "x,y,z,w,v"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        tags: {
          type: "string",
          format: "list",
          maxItems: 2,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(
      errors.filter((e: { type: string }) => e.type === "cell/maxItems"),
    ).toHaveLength(1)
    expect(errors).toContainEqual({
      type: "cell/maxItems",
      columnName: "tags",
      maxItems: 2,
      rowNumber: 3,
      cell: "x,y,z,w,v",
    })
  })

  it("should handle maxItems of 1", async () => {
    const table = pl
      .DataFrame({
        tags: ["a", "b,c", "d"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        tags: {
          type: "string",
          format: "list",
          maxItems: 1,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(
      errors.filter((e: { type: string }) => e.type === "cell/maxItems"),
    ).toHaveLength(1)
    expect(errors).toContainEqual({
      type: "cell/maxItems",
      columnName: "tags",
      maxItems: 1,
      rowNumber: 2,
      cell: "b,c",
    })
  })
})
