import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { inspectTable } from "../../../../actions/table/inspect.ts"

describe("inspectTable (cell/minimum)", () => {
  it("should not errors for valid values", async () => {
    const table = pl
      .DataFrame({
        price: [10.5, 20.75, 30.0],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        price: {
          type: "number",
          minimum: 5,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should report an error for invalid values", async () => {
    const table = pl
      .DataFrame({
        temperature: [20.5, 30.0, 40, 3.5],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        temperature: {
          type: "number",
          minimum: 10,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(
      errors.filter((e: { type: string }) => e.type === "cell/minimum"),
    ).toHaveLength(1)
    expect(errors).toContainEqual({
      type: "cell/minimum",
      columnName: "temperature",
      minimum: "10",
      rowNumber: 4,
      cell: "3.5",
    })
  })

  it("should report an error for invalid values (exclusive)", async () => {
    const table = pl
      .DataFrame({
        temperature: [20.5, 30.0, 10.0, 5.5],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        temperature: {
          type: "number",
          exclusiveMinimum: 10,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(
      errors.filter((e: { type: string }) => e.type === "cell/exclusiveMinimum"),
    ).toHaveLength(2)
    expect(errors).toContainEqual({
      type: "cell/exclusiveMinimum",
      columnName: "temperature",
      minimum: "10",
      rowNumber: 3,
      cell: "10",
    })
    expect(errors).toContainEqual({
      type: "cell/exclusiveMinimum",
      columnName: "temperature",
      minimum: "10",
      rowNumber: 4,
      cell: "5.5",
    })
  })

  it("should handle minimum as number", async () => {
    const table = pl
      .DataFrame({
        price: [10.5, 20.75, 3.0],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        price: {
          type: "number",
          minimum: 5,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([
      {
        type: "cell/minimum",
        columnName: "price",
        minimum: "5",
        rowNumber: 3,
        cell: "3",
      },
    ])
  })

  it("should handle exclusiveMinimum as number", async () => {
    const table = pl
      .DataFrame({
        temperature: [20.5, 10.0, 5.5],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        temperature: {
          type: "number",
          exclusiveMinimum: 10,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([
      {
        type: "cell/exclusiveMinimum",
        columnName: "temperature",
        minimum: "10",
        rowNumber: 2,
        cell: "10",
      },
      {
        type: "cell/exclusiveMinimum",
        columnName: "temperature",
        minimum: "10",
        rowNumber: 3,
        cell: "5.5",
      },
    ])
  })

  it("should handle minimum with groupChar", async () => {
    const table = pl
      .DataFrame({
        price: ["5,000", "10,500", "2,500"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        price: {
          type: "integer",
          groupChar: ",",
          minimum: 3000,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([
      {
        type: "cell/minimum",
        columnName: "price",
        minimum: "3000",
        rowNumber: 3,
        cell: "2,500",
      },
    ])
  })

  it("should handle minimum with decimalChar", async () => {
    const table = pl
      .DataFrame({
        price: ["5,5", "10,75", "2,3"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        price: {
          type: "number",
          decimalChar: ",",
          minimum: 3,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([
      {
        type: "cell/minimum",
        columnName: "price",
        minimum: "3",
        rowNumber: 3,
        cell: "2,3",
      },
    ])
  })

  it("should handle minimum with groupChar and decimalChar", async () => {
    const table = pl
      .DataFrame({
        price: ["5.000,50", "10.500,75", "2.500,30"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        price: {
          type: "number",
          groupChar: ".",
          decimalChar: ",",
          minimum: 3000,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([
      {
        type: "cell/minimum",
        columnName: "price",
        minimum: "3000",
        rowNumber: 3,
        cell: "2.500,30",
      },
    ])
  })

  it("should handle minimum with withText", async () => {
    const table = pl
      .DataFrame({
        price: ["$5.00", "$10.50", "$2.50"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        price: {
          type: "number",
          withText: true,
          minimum: 3,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([
      {
        type: "cell/minimum",
        columnName: "price",
        minimum: "3",
        rowNumber: 3,
        cell: "$2.50",
      },
    ])
  })

  it("should handle minimum for integer year values", async () => {
    const table = pl
      .DataFrame({
        year: ["2020", "2021", "2018"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        year: {
          type: "integer",
          minimum: 2019,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([
      {
        type: "cell/minimum",
        columnName: "year",
        minimum: "2019",
        rowNumber: 3,
        cell: "2018",
      },
    ])
  })

  it("should validate minimum with nullable property type", async () => {
    const table = pl
      .DataFrame({
        price: [10.5, 3.0, null],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        price: {
          type: ["number", "null"] as const,
          minimum: 5,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([
      {
        type: "cell/minimum",
        columnName: "price",
        minimum: "5",
        rowNumber: 2,
        cell: "3",
      },
    ])
  })

  it("should handle exclusiveMinimum for integer year values", async () => {
    const table = pl
      .DataFrame({
        year: ["2020", "2021", "2019", "2018"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        year: {
          type: "integer",
          exclusiveMinimum: 2019,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([
      {
        type: "cell/exclusiveMinimum",
        columnName: "year",
        minimum: "2019",
        rowNumber: 3,
        cell: "2019",
      },
      {
        type: "cell/exclusiveMinimum",
        columnName: "year",
        minimum: "2019",
        rowNumber: 4,
        cell: "2018",
      },
    ])
  })
})
