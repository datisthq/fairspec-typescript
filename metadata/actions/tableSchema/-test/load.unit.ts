import { join } from "node:path"
import { describe, expect, expectTypeOf, it } from "vite-plus/test"
import type { TableSchema } from "../../../models/tableSchema.ts"
import { loadTableSchema } from "../load.ts"

describe("loadTableSchema", () => {
  const getFixturePath = (name: string) => join(import.meta.dirname, "fixtures", name)
  const expectedSchema = {
    $schema: "https://fairspec.org/profiles/latest/table-schema.json",
    properties: {
      id: {
        type: "integer",
      },
      name: {
        type: "string",
      },
    },
  }

  it("loads a schema from a local file path", async () => {
    const schema = await loadTableSchema(getFixturePath("schema.json"))

    expectTypeOf(schema).toEqualTypeOf<TableSchema>()
    expect(schema).toEqual(expectedSchema)
  })

  it("throws an error when schema is invalid", async () => {
    await expect(loadTableSchema(getFixturePath("schema-invalid.json"))).rejects.toThrow()
  })

  it("loads a full schema with all features", async () => {
    const schema = await loadTableSchema(getFixturePath("schema-full.json"))

    expectTypeOf(schema).toEqualTypeOf<TableSchema>()
    expect(schema).toBeDefined()
    expect(schema.$schema).toBe("https://fairspec.org/profiles/latest/table-schema.json")

    expect(schema.required).toEqual(["id", "email"])

    expect.assert(schema.properties)
    expect(Object.keys(schema.properties)).toHaveLength(9)

    expect(schema.properties.id?.type).toBe("integer")
    expect(schema.properties.id?.title).toBe("User ID")
    expect(schema.properties.id?.description).toBe("Unique identifier for the user")

    expect.assert(schema.properties.email?.type === "string")
    expect.assert(schema.properties.email.format === "email")
    expect(schema.properties.email?.title).toBe("Email Address")

    expect.assert(schema.properties.name?.type === "string")
    expect(schema.properties.name?.minLength).toBe(1)
    expect(schema.properties.name?.maxLength).toBe(100)

    expect.assert(schema.properties.age?.type === "integer")
    expect(schema.properties.age?.minimum).toBe(0)
    expect(schema.properties.age?.maximum).toBe(150)

    expect.assert(schema.properties.created_at?.type === "string")
    expect(schema.properties.created_at?.format).toBe("date-time")

    expect.assert(schema.properties.birth_date?.type === "string")
    expect(schema.properties.birth_date?.format).toBe("date")

    expect(schema.primaryKey).toEqual(["id"])

    expect(schema.uniqueKeys).toHaveLength(2)
    expect(schema.uniqueKeys?.[0]).toEqual(["email"])
    expect(schema.uniqueKeys?.[1]).toEqual(["name", "department_id"])

    expect(schema.foreignKeys).toHaveLength(1)
    expect(schema.foreignKeys?.[0]?.columns).toEqual(["department_id"])
    expect(schema.foreignKeys?.[0]?.reference?.resource).toBe("departments")
    expect(schema.foreignKeys?.[0]?.reference?.columns).toEqual(["id"])

    expect(schema.missingValues).toEqual(["", "NA", "N/A", "null"])
  })
})
