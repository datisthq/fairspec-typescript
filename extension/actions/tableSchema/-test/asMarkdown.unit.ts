import type { TableSchema } from "@fairspec/metadata"
import { describe, expect, it } from "vite-plus/test"
import { renderTableSchemaAsMarkdown } from "../asMarkdown.ts"

describe("renderTableSchemaAsMarkdown", () => {
  it("converts a simple schema to markdown table", () => {
    const schema: TableSchema = {
      properties: {
        id: {
          type: "integer",
          title: "Identifier",
          description: "Unique identifier",
        },
        name: {
          type: "string",
          title: "Name",
          description: "Person name",
        },
      },
    }

    const result = renderTableSchemaAsMarkdown(schema)

    expect(result).toContain("| Name | Type | Title | Description | Constraints |")
    expect(result).toContain("| id | integer | Identifier | Unique identifier |")
    expect(result).toContain("| name | string | Name | Person name |")
  })

  it("handles column constraints", () => {
    const schema: TableSchema = {
      properties: {
        age: {
          type: "integer",
          minimum: 0,
          maximum: 120,
        },
        email: {
          type: "string",
          pattern: "^[a-z]+@[a-z]+\\.[a-z]+$",
        },
      },
      required: ["age", "email"],
    }

    const result = renderTableSchemaAsMarkdown(schema)

    expect(result).toContain("required")
    expect(result).toContain("min: 0")
    expect(result).toContain("max: 120")
    expect(result).toContain("pattern:")
  })

  it("handles empty properties object", () => {
    const schema: TableSchema = {
      properties: {},
    }

    const result = renderTableSchemaAsMarkdown(schema)

    expect(result).toContain("| Name | Type | Title | Description | Constraints |")
  })

  it("handles pipe characters in column values", () => {
    const schema: TableSchema = {
      properties: {
        field: {
          type: "string",
          description: "Description with pipe character",
        },
      },
    }

    const result = renderTableSchemaAsMarkdown(schema)

    expect(result).toContain("Description with pipe character")
  })

  it("handles columns with enum constraints", () => {
    const schema: TableSchema = {
      properties: {
        status: {
          type: "string",
          enum: ["active", "inactive", "pending"],
        },
      },
    }

    const result = renderTableSchemaAsMarkdown(schema)

    expect(result).toContain("enum: active, inactive, pending")
  })

  it("uses frontmatter when frontmatter option is true", () => {
    const schema: TableSchema = {
      title: "Table Schema",
      properties: {
        field1: {
          type: "string",
        },
      },
    }

    const result = renderTableSchemaAsMarkdown(schema, { frontmatter: true })

    expect(result).toContain("---")
    expect(result).toContain("title: Table Schema")
  })

  it("does not use frontmatter when option is false or not provided", () => {
    const schema: TableSchema = {
      properties: {
        field1: {
          type: "string",
        },
      },
    }

    const result = renderTableSchemaAsMarkdown(schema, { frontmatter: false })

    expect(result).not.toContain("title: Table Schema")
    expect(result.startsWith("\n## Columns")).toBe(true)
  })

  it("handles multiple constraint types", () => {
    const schema: TableSchema = {
      properties: {
        username: {
          type: "string",
          minLength: 3,
          maxLength: 20,
          pattern: "^[a-zA-Z0-9_]+$",
        },
      },
      required: ["username"],
    }

    const result = renderTableSchemaAsMarkdown(schema)

    expect(result).toContain("required")
    expect(result).toContain("minLength: 3")
    expect(result).toContain("maxLength: 20")
    expect(result).toContain("pattern:")
  })

  it("handles columns with newlines in descriptions", () => {
    const schema: TableSchema = {
      properties: {
        field: {
          type: "string",
          description: "Description with\nnewline",
        },
      },
    }

    const result = renderTableSchemaAsMarkdown(schema)

    expect(result).toContain("Description with newline")
    expect(result).not.toContain("Description with\nnewline")
  })
})
