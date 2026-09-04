import type { TableSchema } from "@fairspec/metadata"
import { describe, expect, it } from "vite-plus/test"
import { renderTableSchemaAsHtml } from "../asHtml.tsx"

describe("renderTableSchemaAsHtml", () => {
  it("converts a simple schema to html table", () => {
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

    const result = renderTableSchemaAsHtml(schema)

    expect(result).toContain("<h2>Columns</h2>")
    expect(result).toContain("<table>")
    expect(result).toContain("<th>Name</th>")
    expect(result).toContain("<th>Definition</th>")
    expect(result).toContain("<th>Type</th>")
    expect(result).toContain("<strong>id?</strong>")
    expect(result).toContain("<strong>name?</strong>")
    expect(result).toContain("<p>Unique identifier</p>")
    expect(result).toContain("<p>Person name</p>")
    expect(result).toContain("<code>integer</code>")
    expect(result).toContain("<code>string</code>")
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

    const result = renderTableSchemaAsHtml(schema)

    expect(result).toContain("<strong>Constraints</strong>")
    expect(result).toContain("minimum:")
    expect(result).toContain("<code>0</code>")
    expect(result).toContain("maximum:")
    expect(result).toContain("<code>120</code>")
    expect(result).toContain("pattern:")
  })

  it("handles required field indicator", () => {
    const schema: TableSchema = {
      properties: {
        requiredField: {
          type: "string",
        },
        optionalField: {
          type: "string",
        },
      },
      required: ["requiredField"],
    }

    const result = renderTableSchemaAsHtml(schema)

    expect(result).toContain("<strong>requiredField</strong>")
    expect(result).not.toContain("requiredField?")
    expect(result).toContain("<strong>optionalField?</strong>")
  })

  it("handles empty properties object", () => {
    const schema: TableSchema = {
      properties: {},
    }

    const result = renderTableSchemaAsHtml(schema)

    expect(result).toContain("<h2>Columns</h2>")
    expect(result).toContain("<table>")
    expect(result).toContain("</table>")
  })

  it("escapes HTML special characters", () => {
    const schema: TableSchema = {
      properties: {
        field: {
          type: "string",
          description: "Description with <script>alert('xss')</script>",
        },
      },
    }

    const result = renderTableSchemaAsHtml(schema)

    expect(result).toContain(
      "Description with &lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;",
    )
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

    const result = renderTableSchemaAsHtml(schema)

    expect(result).toContain("enum:")
    expect(result).toContain("<code>active, inactive, pending</code>")
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

    const result = renderTableSchemaAsHtml(schema)

    expect(result).toContain("minLength:")
    expect(result).toContain("<code>3</code>")
    expect(result).toContain("maxLength:")
    expect(result).toContain("<code>20</code>")
    expect(result).toContain("pattern:")
  })

  it("handles different column types", () => {
    const schema: TableSchema = {
      properties: {
        field1: { type: "string" },
        field2: { type: "integer" },
        field3: { type: "number" },
        field4: { type: "boolean" },
        field5: { type: "string", format: "date-time" },
        field6: { type: "array" },
      },
    }

    const result = renderTableSchemaAsHtml(schema)

    expect(result).toContain("<code>string</code>")
    expect(result).toContain("<code>integer</code>")
    expect(result).toContain("<code>number</code>")
    expect(result).toContain("<code>boolean</code>")
    expect(result).toContain("<code>array</code>")
  })

  it("sanitizes IDs for anchors", () => {
    const schema: TableSchema = {
      properties: {
        "field-with-dashes": {
          type: "string",
        },
        "Field With Spaces": {
          type: "string",
        },
      },
    }

    const result = renderTableSchemaAsHtml(schema)

    expect(result).toContain('id="field-with-dashes"')
    expect(result).toContain('id="field-with-spaces"')
  })

  it("does not include top-level html tags", () => {
    const schema: TableSchema = {
      properties: {
        field1: { type: "string" },
      },
    }

    const result = renderTableSchemaAsHtml(schema)

    expect(result).not.toContain("<!DOCTYPE")
    expect(result).not.toContain("<html>")
    expect(result).not.toContain("<head>")
    expect(result).not.toContain("<body>")
    expect(result).not.toContain("<style>")
  })

  it("handles column without description", () => {
    const schema: TableSchema = {
      properties: {
        field1: {
          type: "string",
        },
      },
    }

    const result = renderTableSchemaAsHtml(schema)

    expect(result).toContain("<strong>field1?</strong>")
    expect(result).toContain("<code>string</code>")
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

    const result = renderTableSchemaAsHtml(schema, { frontmatter: true })

    expect(result).toContain("---")
    expect(result).toContain("title: Table Schema")
  })

  it("handles schema with primary key", () => {
    const schema: TableSchema = {
      properties: {
        id: {
          type: "integer",
        },
        name: {
          type: "string",
        },
      },
      primaryKey: ["id"],
    }

    const result = renderTableSchemaAsHtml(schema)

    expect(result).toContain("<h2>Primary Key</h2>")
    expect(result).toContain("<code>id</code>")
  })

  it("handles schema with composite primary key", () => {
    const schema: TableSchema = {
      properties: {
        user_id: {
          type: "integer",
        },
        project_id: {
          type: "integer",
        },
      },
      primaryKey: ["user_id", "project_id"],
    }

    const result = renderTableSchemaAsHtml(schema)

    expect(result).toContain("<h2>Primary Key</h2>")
    expect(result).toContain("<code>user_id, project_id</code>")
  })

  it("handles schema with foreign keys", () => {
    const schema: TableSchema = {
      properties: {
        user_id: {
          type: "integer",
        },
      },
      foreignKeys: [
        {
          columns: ["user_id"],
          reference: {
            resource: "users",
            columns: ["id"],
          },
        },
      ],
    }

    const result = renderTableSchemaAsHtml(schema)

    expect(result).toContain("<h2>Foreign Keys</h2>")
    expect(result).toContain("<th>Columns</th>")
    expect(result).toContain("<th>Reference Resource</th>")
    expect(result).toContain("<th>Reference Columns</th>")
    expect(result).toContain("<code>user_id</code>")
    expect(result).toContain("<code>users</code>")
    expect(result).toContain("<code>id</code>")
  })

  it("handles schema with multiple foreign keys", () => {
    const schema: TableSchema = {
      properties: {
        user_id: {
          type: "integer",
        },
        project_id: {
          type: "integer",
        },
      },
      foreignKeys: [
        {
          columns: ["user_id"],
          reference: {
            resource: "users",
            columns: ["id"],
          },
        },
        {
          columns: ["project_id"],
          reference: {
            resource: "projects",
            columns: ["id"],
          },
        },
      ],
    }

    const result = renderTableSchemaAsHtml(schema)

    expect(result).toContain("<h2>Foreign Keys</h2>")
    expect(result).toContain("<code>user_id</code>")
    expect(result).toContain("<code>users</code>")
    expect(result).toContain("<code>project_id</code>")
    expect(result).toContain("<code>projects</code>")
  })

  it("handles foreign key without resource specified", () => {
    const schema: TableSchema = {
      properties: {
        parent_id: {
          type: "integer",
        },
      },
      foreignKeys: [
        {
          columns: ["parent_id"],
          reference: {
            columns: ["id"],
          },
        },
      ],
    }

    const result = renderTableSchemaAsHtml(schema)

    expect(result).toContain("<h2>Foreign Keys</h2>")
    expect(result).toContain("<code>parent_id</code>")
    expect(result).toContain("<code>-</code>")
    expect(result).toContain("<code>id</code>")
  })

  it("does not render primary key or foreign keys sections when not present", () => {
    const schema: TableSchema = {
      properties: {
        field1: {
          type: "string",
        },
      },
    }

    const result = renderTableSchemaAsHtml(schema)

    expect(result).not.toContain("<h2>Primary Key</h2>")
    expect(result).not.toContain("<h2>Foreign Keys</h2>")
  })

  it("handles string categories", () => {
    const schema: TableSchema = {
      properties: {
        status: {
          type: "string",
          categories: ["active", "inactive"],
        },
      },
    }

    const result = renderTableSchemaAsHtml(schema)

    expect(result).toContain("<strong>Categories</strong>")
    expect(result).toContain("<code>active</code>")
    expect(result).toContain("<code>inactive</code>")
  })

  it("handles integer categories with labels", () => {
    const schema: TableSchema = {
      properties: {
        level: {
          type: "integer",

          categories: [
            { value: 1, label: "Beginner" },
            { value: 2, label: "Advanced" },
          ],
        },
      },
    }

    const result = renderTableSchemaAsHtml(schema)

    expect(result).toContain("<strong>Categories</strong>")
    expect(result).toContain("<code>1</code>")
    expect(result).toContain(" - Beginner")
    expect(result).toContain("<code>2</code>")
    expect(result).toContain(" - Advanced")
  })
})
