import { describe, expect, expectTypeOf, it } from "vite-plus/test"
import type { TableSchema } from "../../../models/tableSchema.ts"
import { assertTableSchema } from "../assert.ts"

describe("assertTableSchema", () => {
  it("returns typed schema when valid", async () => {
    const descriptor = {
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

    const schema = await assertTableSchema(descriptor)

    expectTypeOf(schema).toEqualTypeOf<TableSchema>()
    expect(schema).toEqual(descriptor)
  })

  it("throws Error when schema is invalid", async () => {
    const descriptor = {
      properties: {
        id: {
          type: 123,
        },
      },
    }

    await expect(assertTableSchema(descriptor)).rejects.toThrow(Error)
  })

  it("accepts schema with all features", async () => {
    const descriptor = {
      required: ["id", "email"],
      properties: {
        id: {
          type: "integer",
          title: "User ID",
        },
        email: {
          type: "string",
          format: "email",
        },
      },
      primaryKey: ["id"],
      uniqueKeys: [["email"]],
      foreignKeys: [
        {
          columns: ["department_id"],
          reference: {
            resource: "departments",
            columns: ["id"],
          },
        },
      ],
      missingValues: ["", "NA"],
    }

    const schema = await assertTableSchema(descriptor)

    expectTypeOf(schema).toEqualTypeOf<TableSchema>()
    expect(schema).toEqual(descriptor)
  })
})
