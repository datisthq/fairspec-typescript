import { z } from "zod"
import { describe, expect, it } from "vite-plus/test"
import { TableSchema } from "../../tableSchema.ts"
import { ColumnProperty } from "../column.ts"

describe("ColumnProperty", () => {
  it("accepts a property without a format", () => {
    for (const type of ["string", "integer", "number", "boolean", "object", "array"]) {
      expect(ColumnProperty.safeParse({ type }).success, type).toBe(true)
    }
  })

  it("accepts a property with a format supported by its type", () => {
    const properties = [
      { type: "string", format: "email" },
      { type: "string", format: "date-time" },
      { type: "string", format: "decimal" },
      { type: "string", format: "categorical" },
      { type: "integer", format: "categorical" },
      { type: "object", format: "geojson" },
    ]

    for (const property of properties) {
      expect(ColumnProperty.safeParse(property).success, property.format).toBe(true)
    }
  })

  it("preserves the format instead of stripping it", () => {
    const result = ColumnProperty.parse({ type: "string", format: "email" })
    expect(result).toEqual({ type: "string", format: "email" })
  })

  it("rejects a format that its type does not support", () => {
    const properties = [
      { type: "string", format: "bogus" },
      { type: "string", format: "geojson" },
      { type: "integer", format: "email" },
      { type: "number", format: "categorical" },
      { type: "boolean", format: "categorical" },
      { type: "object", format: "bogus" },
      { type: "array", format: "list" },
    ]

    for (const property of properties) {
      expect(ColumnProperty.safeParse(property).success, property.format).toBe(false)
    }
  })

  it("rejects an empty format", () => {
    for (const type of ["string", "integer", "number", "boolean", "object", "array"]) {
      expect(ColumnProperty.safeParse({ type, format: "" }).success, type).toBe(false)
    }
  })
})

describe("TableSchema", () => {
  it("converts to JSON Schema for the MCP server", () => {
    const jsonSchema = z.toJSONSchema(TableSchema, { target: "draft-7", io: "output" })
    expect(jsonSchema).toBeTruthy()
  })
})
