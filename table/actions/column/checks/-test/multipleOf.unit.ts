import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { inspectTable } from "../../../../actions/table/inspect.ts"

// TODO: Recover skipped tests

describe("inspectTable (cell/multipleOf)", () => {
  it("should not report errors for valid integer multiples", async () => {
    const table = pl
      .DataFrame({
        quantity: [10, 20, 30, 40],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        quantity: {
          type: "integer",
          multipleOf: 10,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should report an error for invalid integer values", async () => {
    const table = pl
      .DataFrame({
        quantity: [10, 15, 20],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        quantity: {
          type: "integer",
          multipleOf: 10,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(
      errors.filter((e: { type: string }) => e.type === "cell/multipleOf"),
    ).toHaveLength(1)
    expect(errors).toContainEqual({
      type: "cell/multipleOf",
      columnName: "quantity",
      multipleOf: 10,
      rowNumber: 2,
      cell: "15",
    })
  })

  it("should not report errors for valid number multiples", async () => {
    const table = pl
      .DataFrame({
        price: [2.5, 5.0, 7.5],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        price: {
          type: "number",
          multipleOf: 2.5,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should report an error for invalid number values", async () => {
    const table = pl
      .DataFrame({
        price: [2.5, 3.7, 5.0],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        price: {
          type: "number",
          multipleOf: 2.5,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(
      errors.filter((e: { type: string }) => e.type === "cell/multipleOf"),
    ).toHaveLength(1)
    expect(errors).toContainEqual({
      type: "cell/multipleOf",
      columnName: "price",
      multipleOf: 2.5,
      rowNumber: 2,
      cell: "3.7",
    })
  })

  it.skip("should handle multipleOf with groupChar", async () => {
    const table = pl
      .DataFrame({
        amount: ["10,000", "15,000", "20,000"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        amount: {
          type: "integer",
          groupChar: ",",
          multipleOf: 10000,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should handle multipleOf with groupChar and detect errors", async () => {
    const table = pl
      .DataFrame({
        amount: ["10,000", "12,500", "20,000"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        amount: {
          type: "integer",
          groupChar: ",",
          multipleOf: 10000,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([
      {
        type: "cell/multipleOf",
        columnName: "amount",
        multipleOf: 10000,
        rowNumber: 2,
        cell: "12,500",
      },
    ])
  })

  it("should handle multipleOf with decimalChar", async () => {
    const table = pl
      .DataFrame({
        price: ["2,5", "5,0", "7,5"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        price: {
          type: "number",
          decimalChar: ",",
          multipleOf: 2.5,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should handle multipleOf with decimalChar and detect errors", async () => {
    const table = pl
      .DataFrame({
        price: ["2,5", "3,7", "5,0"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        price: {
          type: "number",
          decimalChar: ",",
          multipleOf: 2.5,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([
      {
        type: "cell/multipleOf",
        columnName: "price",
        multipleOf: 2.5,
        rowNumber: 2,
        cell: "3,7",
      },
    ])
  })

  it("should handle multipleOf with groupChar and decimalChar", async () => {
    const table = pl
      .DataFrame({
        price: ["1.000,00", "2.000,00", "3.000,00"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        price: {
          type: "number",
          groupChar: ".",
          decimalChar: ",",
          multipleOf: 1000,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should handle multipleOf with groupChar and decimalChar and detect errors", async () => {
    const table = pl
      .DataFrame({
        price: ["1.000,00", "1.500,00", "2.000,00"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        price: {
          type: "number",
          groupChar: ".",
          decimalChar: ",",
          multipleOf: 1000,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([
      {
        type: "cell/multipleOf",
        columnName: "price",
        multipleOf: 1000,
        rowNumber: 2,
        cell: "1.500,00",
      },
    ])
  })

  it("should handle multipleOf with withText", async () => {
    const table = pl
      .DataFrame({
        price: ["$5.00", "$10.00", "$15.00"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        price: {
          type: "number",
          withText: true,
          multipleOf: 5,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should handle multipleOf with withText and detect errors", async () => {
    const table = pl
      .DataFrame({
        price: ["$5.00", "$7.50", "$10.00"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        price: {
          type: "number",
          withText: true,
          multipleOf: 5,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([
      {
        type: "cell/multipleOf",
        columnName: "price",
        multipleOf: 5,
        rowNumber: 2,
        cell: "$7.50",
      },
    ])
  })

  it.skip("should handle multipleOf for decimal format", async () => {
    const table = pl
      .DataFrame({
        amount: ["100.50", "201.00", "301.50"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        amount: {
          type: "string",
          format: "decimal",
          multipleOf: 100.5,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it.skip("should handle multipleOf for decimal format and detect errors", async () => {
    const table = pl
      .DataFrame({
        amount: ["100.50", "150.75", "201.00"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        amount: {
          type: "string",
          format: "decimal",
          multipleOf: 100.5,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([
      {
        type: "cell/multipleOf",
        columnName: "amount",
        multipleOf: 100.5,
        rowNumber: 2,
        cell: "150.75",
      },
    ])
  })

  it("should handle multipleOf 1", async () => {
    const table = pl
      .DataFrame({
        count: [1, 2, 3, 4],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        count: {
          type: "integer",
          multipleOf: 1,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it.skip("should handle multipleOf 0.1", async () => {
    const table = pl
      .DataFrame({
        measurement: [1.1, 1.2, 1.3],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        measurement: {
          type: "number",
          multipleOf: 0.1,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })
})
