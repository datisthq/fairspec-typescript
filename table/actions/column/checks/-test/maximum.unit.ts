import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { inspectTable } from "../../../../actions/table/inspect.ts"

describe("inspectTable (cell/maximum)", () => {
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
          maximum: 50,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should report an error for invalid values", async () => {
    const table = pl
      .DataFrame({
        temperature: [20.5, 30.0, 40, 50.5],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        temperature: {
          type: "number",
          maximum: 40,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(
      errors.filter((e: { type: string }) => e.type === "cell/maximum"),
    ).toHaveLength(1)
    expect(errors).toContainEqual({
      type: "cell/maximum",
      columnName: "temperature",
      maximum: "40",
      rowNumber: 4,
      cell: "50.5",
    })
  })

  it("should report an error for invalid values (exclusive)", async () => {
    const table = pl
      .DataFrame({
        temperature: [20.5, 30.0, 40.0, 50.5],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        temperature: {
          type: "number",
          exclusiveMaximum: 40,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(
      errors.filter((e: { type: string }) => e.type === "cell/exclusiveMaximum"),
    ).toHaveLength(2)
    expect(errors).toContainEqual({
      type: "cell/exclusiveMaximum",
      columnName: "temperature",
      maximum: "40",
      rowNumber: 3,
      cell: "40",
    })
    expect(errors).toContainEqual({
      type: "cell/exclusiveMaximum",
      columnName: "temperature",
      maximum: "40",
      rowNumber: 4,
      cell: "50.5",
    })
  })

  it("should handle maximum as string", async () => {
    const table = pl
      .DataFrame({
        price: [10.5, 20.75, 55.0],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        price: {
          type: "number",
          maximum: 50,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([
      {
        type: "cell/maximum",
        columnName: "price",
        maximum: "50",
        rowNumber: 3,
        cell: "55",
      },
    ])
  })

  it("should handle exclusiveMaximum as string", async () => {
    const table = pl
      .DataFrame({
        temperature: [20.5, 40.0, 50.5],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        temperature: {
          type: "number",
          exclusiveMaximum: 40,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([
      {
        type: "cell/exclusiveMaximum",
        columnName: "temperature",
        maximum: "40",
        rowNumber: 2,
        cell: "40",
      },
      {
        type: "cell/exclusiveMaximum",
        columnName: "temperature",
        maximum: "40",
        rowNumber: 3,
        cell: "50.5",
      },
    ])
  })

  it("should handle maximum with groupChar", async () => {
    const table = pl
      .DataFrame({
        price: ["5,000", "10,500", "15,000"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        price: {
          type: "integer",
          groupChar: ",",
          maximum: 12000,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([
      {
        type: "cell/maximum",
        columnName: "price",
        maximum: "12000",
        rowNumber: 3,
        cell: "15,000",
      },
    ])
  })

  it("should handle maximum with decimalChar", async () => {
    const table = pl
      .DataFrame({
        price: ["5,5", "10,75", "15,3"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        price: {
          type: "number",
          decimalChar: ",",
          maximum: 12,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([
      {
        type: "cell/maximum",
        columnName: "price",
        maximum: "12",
        rowNumber: 3,
        cell: "15,3",
      },
    ])
  })

  it("should handle maximum with groupChar and decimalChar", async () => {
    const table = pl
      .DataFrame({
        price: ["5.000,50", "10.500,75", "15.000,30"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        price: {
          type: "number",
          groupChar: ".",
          decimalChar: ",",
          maximum: 12000,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([
      {
        type: "cell/maximum",
        columnName: "price",
        maximum: "12000",
        rowNumber: 3,
        cell: "15.000,30",
      },
    ])
  })

  it("should handle maximum with withText", async () => {
    const table = pl
      .DataFrame({
        price: ["$5.00", "$10.50", "$15.50"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        price: {
          type: "number",
          withText: true,
          maximum: 12,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([
      {
        type: "cell/maximum",
        columnName: "price",
        maximum: "12",
        rowNumber: 3,
        cell: "$15.50",
      },
    ])
  })

  it("should handle maximum for integer year values", async () => {
    const table = pl
      .DataFrame({
        year: ["2020", "2021", "2023"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        year: {
          type: "integer",
          maximum: 2022,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([
      {
        type: "cell/maximum",
        columnName: "year",
        maximum: "2022",
        rowNumber: 3,
        cell: "2023",
      },
    ])
  })

  it("should handle exclusiveMaximum for integer year values", async () => {
    const table = pl
      .DataFrame({
        year: ["2020", "2021", "2022", "2023"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        year: {
          type: "integer",
          exclusiveMaximum: 2022,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([
      {
        type: "cell/exclusiveMaximum",
        columnName: "year",
        maximum: "2022",
        rowNumber: 3,
        cell: "2022",
      },
      {
        type: "cell/exclusiveMaximum",
        columnName: "year",
        maximum: "2022",
        rowNumber: 4,
        cell: "2023",
      },
    ])
  })
})
