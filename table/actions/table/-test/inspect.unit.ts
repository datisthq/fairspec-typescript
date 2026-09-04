import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { inspectTable } from "../inspect.ts"

describe("inspectTable", () => {
  it("should pass when columns exactly match", async () => {
    const table = pl
      .DataFrame({
        id: [1, 2],
        name: ["John", "Jane"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "number" },
        name: { type: "string" },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([])
  })

  it("should not have columns error when columns same length", async () => {
    const table = pl
      .DataFrame({
        id: [1, 2],
        age: [30, 25],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "number" },
        name: { type: "number" },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([
      {
        type: "column/missing",
        columnName: "name",
      },
    ])
  })

  it("should detect missing columns", async () => {
    const table = pl
      .DataFrame({
        id: [1, 2],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "number" },
        name: { type: "string" },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(1)
    expect(errors).toContainEqual({
      type: "column/missing",
      columnName: "name",
    })
  })

  it("should pass when column names match regardless of order", async () => {
    const table = pl
      .DataFrame({
        name: ["John", "Jane"],
        id: [1, 2],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "number" },
        name: { type: "string" },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([])
  })

  it("should detect missing columns", async () => {
    const table = pl
      .DataFrame({
        id: [1, 2],
      })
      .lazy()

    const tableSchema: TableSchema = {
      required: ["name"],
      properties: {
        id: { type: "number" },
        name: { type: "string" },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(1)
    expect(errors).toContainEqual({
      type: "column/missing",
      columnName: "name",
    })
  })

  // TODO: Decide on required
  it.skip("should pass when non-required columns are missing", async () => {
    const table = pl
      .DataFrame({
        id: [1, 2],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "number" },
        name: { type: "string" },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([])
  })

  it("should pass when data contains all schema columns", async () => {
    const table = pl
      .DataFrame({
        id: [1, 2],
        name: ["John", "Jane"],
        age: [30, 25],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "number" },
        name: { type: "string" },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([])
  })

  it("should pass when data contains exact schema columns", async () => {
    const table = pl
      .DataFrame({
        id: [1, 2],
        name: ["John", "Jane"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "number" },
        name: { type: "string" },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([])
  })

  it("should detect missing columns", async () => {
    const table = pl
      .DataFrame({
        id: [1, 2],
      })
      .lazy()

    const tableSchema: TableSchema = {
      required: ["name"],
      properties: {
        id: { type: "number" },
        name: { type: "string" },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toContainEqual({
      type: "column/missing",
      columnName: "name",
    })
  })

  // TODO: Decide on required
  it.skip("should pass when schema contains all data columns", async () => {
    const table = pl
      .DataFrame({
        id: [1, 2],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "number" },
        name: { type: "string" },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([])
  })

  it("should pass when schema contains exact data columns", async () => {
    const table = pl
      .DataFrame({
        id: [1, 2],
        name: ["John", "Jane"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "number" },
        name: { type: "string" },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([])
  })

  // TODO: Decide on required
  it.skip("should pass when at least one column matches", async () => {
    const table = pl
      .DataFrame({
        id: [1, 2],
        age: [30, 25],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "number" },
        name: { type: "string" },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([])
  })

  it("should detect missing columns with allRequired", async () => {
    const table = pl
      .DataFrame({
        id: [1, 2],
      })
      .lazy()

    const tableSchema: TableSchema = {
      allRequired: true,
      properties: {
        id: { type: "number" },
        name: { type: "string" },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toContainEqual({
      type: "column/missing",
      columnName: "name",
    })
  })

  it("should detect when no columns match", async () => {
    const table = pl
      .DataFrame({
        age: [30, 25],
        email: ["john@example.com", "jane@example.com"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "number" },
        name: { type: "string" },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(2)
    expect(errors).toContainEqual({
      type: "column/missing",
      columnName: "id",
    })
    expect(errors).toContainEqual({
      type: "column/missing",
      columnName: "name",
    })
  })
})
