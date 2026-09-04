import type { Resource } from "@fairspec/metadata"
import { describe, expect, it } from "vite-plus/test"
import { inferDataSchema } from "../infer.ts"

describe("inferDataSchema", () => {
  it("should infer schema from object data", async () => {
    const resource: Resource = {
      data: { name: "test", count: 5, active: true },
    }

    const schema = await inferDataSchema(resource)
    expect(schema).toEqual({
      type: "object",
      properties: {
        name: { type: "string" },
        count: { type: "integer" },
        active: { type: "boolean" },
      },
    })
  })

  it("should infer schema from array of objects", async () => {
    const resource: Resource = {
      data: [
        { id: 1, name: "alice" },
        { id: 2, name: "bob" },
      ],
    }

    const schema = await inferDataSchema(resource)
    expect(schema).toEqual({
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
        },
      },
    })
  })

  it("should return undefined when no data", async () => {
    const resource: Resource = { name: "empty" }

    const schema = await inferDataSchema(resource)
    expect(schema).toBeUndefined()
  })
})
