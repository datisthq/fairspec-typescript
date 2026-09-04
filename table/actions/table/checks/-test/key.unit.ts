import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { inspectTable } from "../../inspect.ts"

describe("inspectTable (row/unique)", () => {
  it("should not errors when all rows are unique for primary key", async () => {
    const table = pl
      .DataFrame({
        id: [1, 2, 3, 4, 5],
        name: ["Alice", "Bob", "Charlie", "David", "Eve"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "number" },
        name: { type: "string" },
      },
      primaryKey: ["id"],
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should errors for duplicate primary key rows", async () => {
    const table = pl
      .DataFrame({
        id: [1, 2, 3, 2, 5],
        name: ["Alice", "Bob", "Charlie", "Bob2", "Eve"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "number" },
        name: { type: "string" },
      },
      primaryKey: ["id"],
    }

    const errors = await inspectTable(table, { tableSchema })

    expect(errors.filter(e => e.type === "row/primaryKey")).toHaveLength(1)
    expect(errors).toEqual([
      {
        type: "row/primaryKey",
        rowNumber: 4,
        columnNames: ["id"],
      },
    ])
  })

  it("should not errors when all rows are unique for unique key", async () => {
    const table = pl
      .DataFrame({
        id: [1, 2, 3, 4, 5],
        email: ["a@test.com", "b@test.com", "c@test.com", "d@test.com", "e@test.com"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "number" },
        email: { type: "string" },
      },
      uniqueKeys: [["email"]],
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should errors for duplicate unique key rows", async () => {
    const table = pl
      .DataFrame({
        id: [1, 2, 3, 4, 5],
        email: ["a@test.com", "b@test.com", "a@test.com", "d@test.com", "b@test.com"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "number" },
        email: { type: "string" },
      },
      uniqueKeys: [["email"]],
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors.filter(e => e.type === "row/uniqueKey")).toHaveLength(2)
    expect(errors).toEqual([
      {
        type: "row/uniqueKey",
        rowNumber: 3,
        columnNames: ["email"],
      },
      {
        type: "row/uniqueKey",
        rowNumber: 5,
        columnNames: ["email"],
      },
    ])
  })

  it("should handle composite unique keys", async () => {
    const table = pl
      .DataFrame({
        category: ["A", "A", "B", "A", "B"],
        subcategory: ["X", "Y", "X", "X", "Y"],
        value: [1, 2, 3, 4, 5],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        category: { type: "string" },
        subcategory: { type: "string" },
        value: { type: "number" },
      },
      uniqueKeys: [["category", "subcategory"]],
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors.filter(e => e.type === "row/uniqueKey")).toHaveLength(1)
    expect(errors).toEqual([
      {
        type: "row/uniqueKey",
        rowNumber: 4,
        columnNames: ["category", "subcategory"],
      },
    ])
  })

  it("should handle both primary key and unique keys", async () => {
    const table = pl
      .DataFrame({
        id: [1, 2, 3, 2, 5],
        email: ["a@test.com", "b@test.com", "c@test.com", "d@test.com", "a@test.com"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "number" },
        email: { type: "string" },
      },
      primaryKey: ["id"],
      uniqueKeys: [["email"]],
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(2)
    expect(errors).toContainEqual({
      type: "row/primaryKey",
      rowNumber: 4,
      columnNames: ["id"],
    })
    expect(errors).toContainEqual({
      type: "row/uniqueKey",
      rowNumber: 5,
      columnNames: ["email"],
    })
  })

  it("should handle null values in unique keys correctly", async () => {
    const table = pl
      .DataFrame({
        id: [1, 2, null, 4, null, 2],
        name: ["Alice", "Bob", "Charlie", "David", "Eve", "Bob"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: ["number", "null"] as const },
        name: { type: "string" },
      },
      uniqueKeys: [["id"], ["id", "name"]],
    }

    const errors = await inspectTable(table, { tableSchema })
    console.log(errors)

    expect(errors).toHaveLength(2)
    expect(errors).toContainEqual({
      type: "row/uniqueKey",
      rowNumber: 6,
      columnNames: ["id"],
    })
    expect(errors).toContainEqual({
      type: "row/uniqueKey",
      rowNumber: 6,
      columnNames: ["id", "name"],
    })
  })
})
