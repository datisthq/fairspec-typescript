import type { Resource } from "@fairspec/library"
import { writeTempFile } from "@fairspec/library"
import { describe, expect, it } from "vite-plus/test"
import { inferDataSchemaTool } from "./infer.ts"

describe("inferDataSchemaTool", () => {
  it("validates tool structure", () => {
    expect(inferDataSchemaTool.id).toBe("infer-data-schema")
    expect(inferDataSchemaTool.description).toBeTruthy()
    expect(inferDataSchemaTool.inputSchema).toBeTruthy()
    expect(inferDataSchemaTool.outputSchema).toBeTruthy()
    expect(inferDataSchemaTool.execute).toBeTypeOf("function")
  })

  it("infers schema from object data", async () => {
    const resource: Resource = {
      data: { name: "test", count: 5, active: true },
    }

    const result = await inferDataSchemaTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.dataSchema).toEqual({
      type: "object",
      properties: {
        name: { type: "string" },
        count: { type: "integer" },
        active: { type: "boolean" },
      },
    })
  })

  it("infers schema from array of objects", async () => {
    const resource: Resource = {
      data: [
        { id: 1, name: "alice" },
        { id: 2, name: "bob" },
      ],
    }

    const result = await inferDataSchemaTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.dataSchema).toEqual({
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

  it("infers schema from JSON file", async () => {
    const jsonData = { name: "alice", age: 25, active: true }
    const path = await writeTempFile(JSON.stringify(jsonData), {
      format: "json",
    })
    const resource: Resource = { data: path }

    const result = await inferDataSchemaTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.dataSchema).toEqual({
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "integer" },
        active: { type: "boolean" },
      },
    })
  })

  it("infers schema with nested objects", async () => {
    const resource: Resource = {
      data: {
        user: {
          name: "alice",
          contact: { email: "alice@example.com", phone: "555-1234" },
        },
        metadata: { created: "2024-01-01", version: 1 },
      },
    }

    const result = await inferDataSchemaTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.dataSchema).toMatchObject({
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: expect.any(Object),
        },
        metadata: {
          type: "object",
          properties: expect.any(Object),
        },
      },
    })
  })

  it("infers schema with array properties", async () => {
    const resource: Resource = {
      data: {
        id: 1,
        name: "alice",
        tags: ["admin", "user"],
        scores: [95, 87, 92],
      },
    }

    const result = await inferDataSchemaTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.dataSchema).toMatchObject({
      type: "object",
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        tags: {
          type: "array",
          items: expect.any(Object),
        },
        scores: {
          type: "array",
          items: expect.any(Object),
        },
      },
    })
  })

  it("infers schema from complex nested structure", async () => {
    const resource: Resource = {
      data: {
        users: [
          {
            id: 1,
            profile: { name: "alice", age: 25 },
            roles: ["admin"],
          },
          {
            id: 2,
            profile: { name: "bob", age: 30 },
            roles: ["user"],
          },
        ],
      },
    }

    const result = await inferDataSchemaTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.dataSchema).toMatchObject({
      type: "object",
      properties: {
        users: {
          type: "array",
          items: {
            type: "object",
            properties: expect.any(Object),
          },
        },
      },
    })
  })

  it("returns undefined for resource without data", async () => {
    const resource: Resource = { name: "empty" }

    const result = await inferDataSchemaTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))
    expect(result.dataSchema).toBeUndefined()
  })

  it("infers schema from different data types", async () => {
    const resource: Resource = {
      data: {
        string: "text",
        integer: 42,
        number: 3.14,
        boolean: true,
        null: null,
      },
    }

    const result = await inferDataSchemaTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.dataSchema).toEqual({
      type: "object",
      properties: {
        string: { type: "string" },
        integer: { type: "integer" },
        number: { type: "number" },
        boolean: { type: "boolean" },
        null: { type: "null" },
      },
    })
  })

  it("infers schema from array of primitives", async () => {
    const resource: Resource = {
      data: [1, 2, 3, 4, 5],
    }

    const result = await inferDataSchemaTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.dataSchema).toEqual({
      type: "array",
      items: { type: "integer" },
    })
  })
})
