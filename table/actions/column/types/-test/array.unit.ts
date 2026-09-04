import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { inspectTable } from "../../../../actions/table/inspect.ts"

describe("validateArrayColumn", () => {
  it("should not error for valid JSON arrays", async () => {
    const table = pl
      .DataFrame({
        tags: ['["tag1","tag2"]', "[1,2,3]", '["a","b","c"]'],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        tags: {
          type: "array",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should not errors for empty arrays", async () => {
    const table = pl
      .DataFrame({
        items: ["[]", "[]", "[]"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        items: {
          type: "array",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should not errors for null values", async () => {
    const table = pl
      .DataFrame({
        data: ['["value"]', null, "[1,2,3]"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        data: {
          type: "array",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should errors for JSON objects", async () => {
    const table = pl
      .DataFrame({
        data: ["[1,2,3]", '{"key":"value"}', '["a","b"]'],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        data: {
          type: "array",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([
      {
        type: "cell/type",
        columnName: "data",
        columnType: "array",
        rowNumber: 2,
        cell: '{"key":"value"}',
      },
    ])
  })

  it("should errors for invalid JSON", async () => {
    const table = pl
      .DataFrame({
        data: ['["valid"]', "invalid json", "[1,2,3]", "[broken"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        data: {
          type: "array",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors.filter(e => e.type === "cell/type")).toHaveLength(2)
    expect(errors).toContainEqual({
      type: "cell/type",
      columnName: "data",
      columnType: "array",
      rowNumber: 2,
      cell: "invalid json",
    })
    expect(errors).toContainEqual({
      type: "cell/type",
      columnName: "data",
      columnType: "array",
      rowNumber: 4,
      cell: "[broken",
    })
  })

  it("should handle nested arrays", async () => {
    const table = pl
      .DataFrame({
        matrix: ["[[1,2],[3,4]]", "[[5,6],[7,8]]", '[["a","b"],["c","d"]]'],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        matrix: {
          type: "array",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should errors for empty strings", async () => {
    const table = pl
      .DataFrame({
        data: ['["valid"]', "", "[1,2,3]"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        data: {
          type: "array",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([
      {
        type: "cell/type",
        columnName: "data",
        columnType: "array",
        rowNumber: 2,
        cell: "",
      },
    ])
  })

  it("should errors for JSON primitives", async () => {
    const table = pl
      .DataFrame({
        data: ['"string"', "123", "true", "false", "null"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        data: {
          type: "array",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([
      {
        type: "cell/type",
        columnName: "data",
        columnType: "array",
        rowNumber: 1,
        cell: '"string"',
      },
      {
        type: "cell/type",
        columnName: "data",
        columnType: "array",
        rowNumber: 2,
        cell: "123",
      },
      {
        type: "cell/type",
        columnName: "data",
        columnType: "array",
        rowNumber: 3,
        cell: "true",
      },
      {
        type: "cell/type",
        columnName: "data",
        columnType: "array",
        rowNumber: 4,
        cell: "false",
      },
      {
        type: "cell/type",
        columnName: "data",
        columnType: "array",
        rowNumber: 5,
        cell: "null",
      },
    ])
  })

  it("should not errors for arrays matching jsonSchema", async () => {
    const table = pl
      .DataFrame({
        scores: ["[80,90,100]", "[75,85,95]", "[90,95,100]"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        scores: {
          type: "array",
          items: { type: "number" },
          minItems: 3,
          maxItems: 3,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should errors for arrays not matching jsonSchema", async () => {
    const table = pl
      .DataFrame({
        numbers: ["[1,2,3]", '["not","numbers"]', "[1]", "[4,5,6]"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        numbers: {
          type: "array",
          items: { type: "number" },
          minItems: 2,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors.filter(e => e.type === "cell/json")).toEqual([
      {
        type: "cell/json",
        columnName: "numbers",
        rowNumber: 2,
        cell: '["not","numbers"]',
        message: "must be number",
        jsonPointer: "/0",
      },
      {
        type: "cell/json",
        columnName: "numbers",
        rowNumber: 2,
        cell: '["not","numbers"]',
        message: "must be number",
        jsonPointer: "/1",
      },
      {
        type: "cell/json",
        columnName: "numbers",
        rowNumber: 3,
        cell: "[1]",
        message: "must NOT have fewer than 2 items",
        jsonPointer: "",
      },
    ])
  })

  it("should validate complex jsonSchema with array of objects", async () => {
    const table = pl
      .DataFrame({
        users: [
          '[{"name":"John","age":30},{"name":"Jane","age":25}]',
          '[{"name":"Bob","age":"invalid"}]',
        ],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        users: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              age: { type: "number" },
            },
            required: ["name", "age"],
          },
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([
      {
        type: "cell/json",
        columnName: "users",
        rowNumber: 2,
        cell: '[{"name":"Bob","age":"invalid"}]',
        message: "must be number",
        jsonPointer: "/0/age",
      },
    ])
  })

  it("should validate jsonSchema with unique items constraint", async () => {
    const table = pl
      .DataFrame({
        tags: ['["unique","values"]', '["duplicate","duplicate"]'],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        tags: {
          type: "array",
          items: { type: "string" },
          uniqueItems: true,
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([
      {
        type: "cell/json",
        columnName: "tags",
        rowNumber: 2,
        cell: '["duplicate","duplicate"]',
        message: "must NOT have duplicate items (items ## 1 and 0 are identical)",
        jsonPointer: "",
      },
    ])
  })
})
