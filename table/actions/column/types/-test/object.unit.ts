import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { inspectTable } from "../../../../actions/table/inspect.ts"

describe("validateObjectColumn", () => {
  it("should not errors for valid JSON objects", async () => {
    const table = pl
      .DataFrame({
        metadata: ['{"key":"value"}', '{"num":123}', '{"arr":[1,2,3]}'],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        metadata: {
          type: "object",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should errors for JSON arrays", async () => {
    const table = pl
      .DataFrame({
        data: ["[1,2,3]", '{"key":"value"}', '["a","b","c"]'],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        data: {
          type: "object",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([
      {
        type: "cell/type",
        columnName: "data",
        columnType: "object",
        rowNumber: 1,
        cell: "[1,2,3]",
      },
      {
        type: "cell/type",
        columnName: "data",
        columnType: "object",
        rowNumber: 3,
        cell: '["a","b","c"]',
      },
    ])
  })

  it("should not errors for null values", async () => {
    const table = pl
      .DataFrame({
        config: ['{"key":"value"}', null, '{"num":123}'],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        config: {
          type: "object",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should errors for invalid JSON", async () => {
    const table = pl
      .DataFrame({
        data: ['{"valid":true}', "invalid json", '{"key":"value"}', "{broken}"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        data: {
          type: "object",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors.filter(e => e.type === "cell/type")).toHaveLength(2)
    expect(errors).toContainEqual({
      type: "cell/type",
      columnName: "data",
      columnType: "object",
      rowNumber: 2,
      cell: "invalid json",
    })
    expect(errors).toContainEqual({
      type: "cell/type",
      columnName: "data",
      columnType: "object",
      rowNumber: 4,
      cell: "{broken}",
    })
  })

  it("should handle complex nested JSON structures", async () => {
    const table = pl
      .DataFrame({
        complex: [
          '{"user":{"name":"John","age":30,"tags":["admin","user"]}}',
          '{"nested":{"deep":{"value":true}}}',
          '{"array":[{"id":1},{"id":2}]}',
        ],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        complex: {
          type: "object",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should errors for empty strings", async () => {
    const table = pl
      .DataFrame({
        data: ['{"valid":true}', "", '{"key":"value"}'],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        data: {
          type: "object",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([
      {
        type: "cell/type",
        columnName: "data",
        columnType: "object",
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
          type: "object",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([
      {
        type: "cell/type",
        columnName: "data",
        columnType: "object",
        rowNumber: 1,
        cell: '"string"',
      },
      {
        type: "cell/type",
        columnName: "data",
        columnType: "object",
        rowNumber: 2,
        cell: "123",
      },
      {
        type: "cell/type",
        columnName: "data",
        columnType: "object",
        rowNumber: 3,
        cell: "true",
      },
      {
        type: "cell/type",
        columnName: "data",
        columnType: "object",
        rowNumber: 4,
        cell: "false",
      },
      {
        type: "cell/type",
        columnName: "data",
        columnType: "object",
        rowNumber: 5,
        cell: "null",
      },
    ])
  })

  it("should not errors for objects matching jsonSchema", async () => {
    const table = pl
      .DataFrame({
        user: [
          '{"name":"John","age":30}',
          '{"name":"Jane","age":25}',
          '{"name":"Bob","age":35}',
        ],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        user: {
          type: "object",
          properties: {
            name: { type: "string" },
            age: { type: "number" },
          },
          required: ["name", "age"],
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should errors for objects not matching jsonSchema", async () => {
    const table = pl
      .DataFrame({
        user: [
          '{"name":"John","age":30}',
          '{"name":"Jane"}',
          '{"age":25}',
          '{"name":"Bob","age":"invalid"}',
        ],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        user: {
          type: "object",
          properties: {
            name: { type: "string" },
            age: { type: "number" },
          },
          required: ["name", "age"],
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors.filter(e => e.type === "cell/json")).toEqual([
      {
        type: "cell/json",
        columnName: "user",
        rowNumber: 2,
        cell: '{"name":"Jane"}',
        message: "must have required property 'age'",
        jsonPointer: "",
      },
      {
        type: "cell/json",
        columnName: "user",
        rowNumber: 3,
        cell: '{"age":25}',
        message: "must have required property 'name'",
        jsonPointer: "",
      },
      {
        type: "cell/json",
        columnName: "user",
        rowNumber: 4,
        cell: '{"name":"Bob","age":"invalid"}',
        message: "must be number",
        jsonPointer: "/age",
      },
    ])
  })

  it("should validate complex jsonSchema with nested objects", async () => {
    const table = pl
      .DataFrame({
        config: [
          '{"database":{"host":"localhost","port":5432},"cache":{"enabled":true}}',
          '{"database":{"host":"localhost","port":"invalid"},"cache":{"enabled":true}}',
        ],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        config: {
          type: "object",
          properties: {
            database: {
              type: "object",
              properties: {
                host: { type: "string" },
                port: { type: "number" },
              },
              required: ["host", "port"],
            },
            cache: {
              type: "object",
              properties: {
                enabled: { type: "boolean" },
              },
              required: ["enabled"],
            },
          },
          required: ["database", "cache"],
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([
      {
        type: "cell/json",
        columnName: "config",
        rowNumber: 2,
        cell: '{"database":{"host":"localhost","port":"invalid"},"cache":{"enabled":true}}',
        message: "must be number",
        jsonPointer: "/database/port",
      },
    ])
  })

  it("should validate jsonSchema with array properties", async () => {
    const table = pl
      .DataFrame({
        data: [
          '{"items":[1,2,3],"name":"test"}',
          '{"items":["not","numbers"],"name":"test"}',
        ],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        data: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: { type: "number" },
            },
            name: { type: "string" },
          },
          required: ["items", "name"],
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors.filter(e => e.type === "cell/json")).toEqual([
      {
        type: "cell/json",
        columnName: "data",
        rowNumber: 2,
        cell: '{"items":["not","numbers"],"name":"test"}',
        message: "must be number",
        jsonPointer: "/items/0",
      },
      {
        type: "cell/json",
        columnName: "data",
        rowNumber: 2,
        cell: '{"items":["not","numbers"],"name":"test"}',
        message: "must be number",
        jsonPointer: "/items/1",
      },
    ])
  })
})
