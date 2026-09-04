import type { Resource } from "@fairspec/library"
import { writeTempFile } from "@fairspec/library"
import { describe, expect, it } from "vite-plus/test"
import { validateDataTool } from "./validate.ts"

describe("validateDataTool", () => {
  it("validates tool structure", () => {
    expect(validateDataTool.id).toBe("validate-data")
    expect(validateDataTool.description).toBeTruthy()
    expect(validateDataTool.inputSchema).toBeTruthy()
    expect(validateDataTool.outputSchema).toBeTruthy()
    expect(validateDataTool.execute).toBeTypeOf("function")
  })

  it("validates data against schema", async () => {
    const resource: Resource = {
      data: { name: "test", count: 5 },
      dataSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          count: { type: "integer" },
        },
      },
    }

    const result = await validateDataTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.report.valid).toBe(true)
    expect(result.report.errors).toHaveLength(0)
  })

  it("detects invalid data", async () => {
    const resource: Resource = {
      data: { name: 123, count: "invalid" },
      dataSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          count: { type: "integer" },
        },
      },
    }

    const result = await validateDataTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.report.valid).toBe(false)
    expect(result.report.errors.length).toBeGreaterThan(0)
    expect(result.report.errors).toContainEqual({
      type: "data",
      jsonPointer: "/name",
      message: "must be string",
    })
    expect(result.report.errors).toContainEqual({
      type: "data",
      jsonPointer: "/count",
      message: "must be integer",
    })
  })

  it("validates data from file path", async () => {
    const jsonData = { name: "alice", age: 25, active: true }
    const dataPath = await writeTempFile(JSON.stringify(jsonData), {
      format: "json",
    })

    const resource: Resource = {
      data: dataPath,
      dataSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "number" },
          active: { type: "boolean" },
        },
        required: ["name", "age"],
      },
    }

    const result = await validateDataTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.report.valid).toBe(true)
    expect(result.report.errors).toHaveLength(0)
  })

  it("detects invalid data from file path", async () => {
    const jsonData = { name: "alice", age: "not a number" }
    const dataPath = await writeTempFile(JSON.stringify(jsonData), {
      format: "json",
    })

    const resource: Resource = {
      data: dataPath,
      dataSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "number" },
        },
        required: ["name", "age"],
      },
    }

    const result = await validateDataTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.report.valid).toBe(false)
    expect(result.report.errors.length).toBeGreaterThan(0)
  })

  it("validates data with nested objects", async () => {
    const resource: Resource = {
      data: {
        name: "alice",
        address: { city: "New York", zip: "10001" },
      },
      dataSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          address: {
            type: "object",
            properties: {
              city: { type: "string" },
              zip: { type: "string" },
            },
          },
        },
      },
    }

    const result = await validateDataTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.report.valid).toBe(true)
    expect(result.report.errors).toHaveLength(0)
  })

  it("validates data with array types", async () => {
    const resource: Resource = {
      data: {
        tags: ["admin", "user"],
        scores: [95, 87, 92],
      },
      dataSchema: {
        type: "object",
        properties: {
          tags: {
            type: "array",
            items: { type: "string" },
          },
          scores: {
            type: "array",
            items: { type: "number" },
          },
        },
      },
    }

    const result = await validateDataTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.report.valid).toBe(true)
    expect(result.report.errors).toHaveLength(0)
  })

  it("returns error when no data but schema expected", async () => {
    const resource: Resource = {
      name: "empty",
      dataSchema: { type: "object" },
    }

    const result = await validateDataTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.report.valid).toBe(false)
    expect(result.report.errors).toHaveLength(1)
    expect(result.report.errors).toContainEqual({
      type: "resource/type",
      expectedResourceType: "data",
    })
  })

  it("validates data with required fields", async () => {
    const resource: Resource = {
      data: { name: "alice" },
      dataSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "number" },
        },
        required: ["name", "age"],
      },
    }

    const result = await validateDataTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.report.valid).toBe(false)
    expect(result.report.errors.length).toBeGreaterThan(0)
  })

  it("validates array data against schema", async () => {
    const resource: Resource = {
      data: [
        { id: 1, name: "alice" },
        { id: 2, name: "bob" },
      ],
      dataSchema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
          },
        },
      },
    }

    const result = await validateDataTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.report.valid).toBe(true)
    expect(result.report.errors).toHaveLength(0)
  })
})
