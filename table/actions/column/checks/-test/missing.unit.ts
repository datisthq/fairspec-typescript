import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { inspectTable } from "../../../../actions/table/inspect.ts"

describe("inspectTable (cell/missing)", () => {
  it("should report a cell/missing error for a required column", async () => {
    const table = pl
      .DataFrame({
        id: [1, null, 3],
      })
      .lazy()

    const tableSchema: TableSchema = {
      required: ["id"],
      properties: {
        id: { type: "number" },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([
      {
        type: "cell/missing",
        columnName: "id",
        rowNumber: 2,
        cell: "",
      },
    ])
  })

  it("should report a cell/missing error for a non-required column", async () => {
    const table = pl
      .DataFrame({
        id: [1, null, 3],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "number" },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([
      {
        type: "cell/missing",
        columnName: "id",
        rowNumber: 2,
        cell: "",
      },
    ])
  })

  it("should not report an error for reversed nullable type", async () => {
    const table = pl
      .DataFrame({
        id: [1, null, 3],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: ["null", "number"] as const },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([])
  })

  it("should not report an error for nullable columns", async () => {
    const table = pl
      .DataFrame({
        id: [1, null, 3],
      })
      .lazy()

    const tableSchema: TableSchema = {
      required: ["id"],
      properties: {
        id: { type: ["number", "null"] as const },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([])
  })

  it("should honor allRequired for non-nullable columns", async () => {
    const table = pl
      .DataFrame({
        id: [1, null, 3],
      })
      .lazy()

    const tableSchema: TableSchema = {
      allRequired: true,
      properties: {
        id: { type: "number" },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([
      {
        type: "cell/missing",
        columnName: "id",
        rowNumber: 2,
        cell: "",
      },
    ])
  })
})
