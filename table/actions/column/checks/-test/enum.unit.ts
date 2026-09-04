import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { inspectTable } from "../../../../actions/table/inspect.ts"

describe("inspectTable (cell/enum)", () => {
  it("should not errors for string values that are in the enum", async () => {
    const table = pl
      .DataFrame({
        status: ["pending", "approved", "rejected", "pending"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        status: {
          type: "string",
          enum: ["pending", "approved", "rejected"],
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should errors for values not in the enum", async () => {
    const allowedValues = ["pending", "approved", "rejected"]

    const table = pl
      .DataFrame({
        status: ["pending", "approved", "unknown", "cancelled", "rejected"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        status: {
          type: "string",
          enum: allowedValues,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors.filter((e: { type: string }) => e.type === "cell/enum")).toHaveLength(2)
    expect(errors).toContainEqual({
      type: "cell/enum",
      columnName: "status",
      enum: allowedValues,
      rowNumber: 3,
      cell: "unknown",
    })
    expect(errors).toContainEqual({
      type: "cell/enum",
      columnName: "status",
      enum: allowedValues,
      rowNumber: 4,
      cell: "cancelled",
    })
  })

  it("should handle null values correctly", async () => {
    const table = pl
      .DataFrame({
        status: ["pending", null, "approved", null],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        status: {
          type: "string",
          enum: ["pending", "approved", "rejected"],
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors.filter((e: { type: string }) => e.type === "cell/enum")).toHaveLength(0)
  })

  it("should handle case sensitivity correctly", async () => {
    const allowedValues = ["pending", "approved", "rejected"]

    const table = pl
      .DataFrame({
        status: ["Pending", "APPROVED", "rejected"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        status: {
          type: "string",
          enum: allowedValues,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors.filter((e: { type: string }) => e.type === "cell/enum")).toHaveLength(2)
    expect(errors).toContainEqual({
      type: "cell/enum",
      columnName: "status",
      enum: allowedValues,
      rowNumber: 1,
      cell: "Pending",
    })
    expect(errors).toContainEqual({
      type: "cell/enum",
      columnName: "status",
      enum: allowedValues,
      rowNumber: 2,
      cell: "APPROVED",
    })
  })

  it("should handle integer enum with number values", async () => {
    const allowedValues = [1, 2, 3]

    const table = pl
      .DataFrame({
        priority: ["1", "2", "5"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        priority: {
          type: "integer",
          enum: allowedValues,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([
      {
        type: "cell/enum",
        columnName: "priority",
        enum: ["1", "2", "3"],
        rowNumber: 3,
        cell: "5",
      },
    ])
  })

  it("should handle number enum with number values", async () => {
    const allowedValues = [1.5, 2.5, 3.5]

    const table = pl
      .DataFrame({
        rating: ["1.5", "2.5", "4.5"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        rating: {
          type: "number",
          enum: allowedValues,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([
      {
        type: "cell/enum",
        columnName: "rating",
        enum: ["1.5", "2.5", "3.5"],
        rowNumber: 3,
        cell: "4.5",
      },
    ])
  })

  it.skip("should handle date enum with string values", async () => {
    const allowedValues = ["2024-01-01", "2024-02-01", "2024-03-01"]

    const table = pl
      .DataFrame({
        date: ["2024-01-01", "2024-02-01", "2024-05-01"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        date: {
          type: "string",
          format: "date",
          enum: allowedValues,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([
      {
        type: "cell/enum",
        columnName: "date",
        enum: allowedValues,
        rowNumber: 3,
        cell: "2024-05-01",
      },
    ])
  })

  it.skip("should handle datetime enum with string values", async () => {
    const allowedValues = [
      "2024-01-01T10:00:00",
      "2024-01-01T14:00:00",
      "2024-01-01T18:00:00",
    ]

    const table = pl
      .DataFrame({
        timestamp: ["2024-01-01T10:00:00", "2024-01-01T14:00:00", "2024-01-01T20:00:00"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        timestamp: {
          type: "string",
          format: "date-time",
          enum: allowedValues,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([
      {
        type: "cell/enum",
        columnName: "timestamp",
        enum: allowedValues,
        rowNumber: 3,
        cell: "2024-01-01T20:00:00",
      },
    ])
  })

  it.skip("should handle time enum with string values", async () => {
    const allowedValues = ["10:00:00", "14:00:00", "18:00:00"]

    const table = pl
      .DataFrame({
        time: ["10:00:00", "14:00:00", "20:00:00"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        time: {
          type: "string",
          format: "time",
          enum: allowedValues,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors).toEqual([
      {
        type: "cell/enum",
        columnName: "time",
        enum: allowedValues,
        rowNumber: 3,
        cell: "20:00:00",
      },
    ])
  })
})
