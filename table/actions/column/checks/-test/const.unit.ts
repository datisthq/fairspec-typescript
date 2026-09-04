import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { inspectTable } from "../../../../actions/table/inspect.ts"

describe("inspectTable (cell/const)", () => {
  it("should not error for string values that match the const", async () => {
    const table = pl
      .DataFrame({
        status: ["active", "active", "active"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        status: {
          type: "string",
          const: "active",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should error for values that do not match the const", async () => {
    const table = pl
      .DataFrame({
        status: ["active", "inactive", "active", "pending"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        status: {
          type: "string",
          const: "active",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors.filter((e: { type: string }) => e.type === "cell/const")).toHaveLength(
      2,
    )
    expect(errors).toContainEqual({
      type: "cell/const",
      columnName: "status",
      const: "active",
      rowNumber: 2,
      cell: "inactive",
    })
    expect(errors).toContainEqual({
      type: "cell/const",
      columnName: "status",
      const: "active",
      rowNumber: 4,
      cell: "pending",
    })
  })

  it("should handle null values correctly", async () => {
    const table = pl
      .DataFrame({
        status: ["active", null, "active", null],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        status: {
          type: "string",
          const: "active",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors.filter((e: { type: string }) => e.type === "cell/const")).toHaveLength(
      0,
    )
  })

  it("should handle case sensitivity correctly", async () => {
    const table = pl
      .DataFrame({
        status: ["Active", "ACTIVE", "active"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        status: {
          type: "string",
          const: "active",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors.filter((e: { type: string }) => e.type === "cell/const")).toHaveLength(
      2,
    )
    expect(errors).toContainEqual({
      type: "cell/const",
      columnName: "status",
      const: "active",
      rowNumber: 1,
      cell: "Active",
    })
    expect(errors).toContainEqual({
      type: "cell/const",
      columnName: "status",
      const: "active",
      rowNumber: 2,
      cell: "ACTIVE",
    })
  })

  it("should handle integer const", async () => {
    const table = pl
      .DataFrame({
        priority: ["1", "1", "2"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        priority: {
          type: "integer",
          const: 1,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors.filter((e: { type: string }) => e.type === "cell/const")).toHaveLength(
      1,
    )
    expect(errors).toContainEqual({
      type: "cell/const",
      columnName: "priority",
      const: "1",
      rowNumber: 3,
      cell: "2",
    })
  })

  it("should handle number const", async () => {
    const table = pl
      .DataFrame({
        rate: ["1.5", "1.5", "2.5"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        rate: {
          type: "number",
          const: 1.5,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors.filter((e: { type: string }) => e.type === "cell/const")).toHaveLength(
      1,
    )
    expect(errors).toContainEqual({
      type: "cell/const",
      columnName: "rate",
      const: "1.5",
      rowNumber: 3,
      cell: "2.5",
    })
  })

  it("should handle boolean const", async () => {
    const table = pl
      .DataFrame({
        enabled: ["true", "true", "false"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        enabled: {
          type: "boolean",
          const: true,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors.filter((e: { type: string }) => e.type === "cell/const")).toHaveLength(
      1,
    )
    expect(errors).toContainEqual({
      type: "cell/const",
      columnName: "enabled",
      const: "true",
      rowNumber: 3,
      cell: "false",
    })
  })
})
