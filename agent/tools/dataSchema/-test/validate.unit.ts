import type { Descriptor } from "@fairspec/library"
import { writeTempFile } from "@fairspec/library"
import { describe, expect, it } from "vite-plus/test"
import { validateDataSchemaTool } from "./validate.ts"

describe("validateDataSchemaTool", () => {
  it("validates tool structure", () => {
    expect(validateDataSchemaTool.id).toBe("validate-data-schema")
    expect(validateDataSchemaTool.description).toBeTruthy()
    expect(validateDataSchemaTool.inputSchema).toBeTruthy()
    expect(validateDataSchemaTool.outputSchema).toBeTruthy()
    expect(validateDataSchemaTool.execute).toBeTypeOf("function")
  })

  it("validates a valid data schema descriptor", async () => {
    const descriptor: Descriptor = {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" },
        active: { type: "boolean" },
      },
      required: ["name", "age"],
    }

    const result = await validateDataSchemaTool.execute?.(
      {
        source: descriptor,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.report.valid).toBe(true)
    expect(result.report.errors).toHaveLength(0)
  })

  it("detects invalid data schema", async () => {
    const descriptor: Descriptor = {
      type: "invalid-type" as unknown as "object",
      properties: {
        name: { type: "string" },
      },
    }

    const result = await validateDataSchemaTool.execute?.(
      {
        source: descriptor,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.report.valid).toBe(false)
    expect(result.report.errors.length).toBeGreaterThan(0)
  })

  it("validates data schema from file path", async () => {
    const descriptor = {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string" },
      },
      required: ["name"],
    }
    const path = await writeTempFile(JSON.stringify(descriptor), {
      format: "json",
    })

    const result = await validateDataSchemaTool.execute?.(
      {
        source: path,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.report.valid).toBe(true)
    expect(result.report.errors).toHaveLength(0)
  })

  it("detects invalid data schema from file path", async () => {
    const descriptor = {
      type: "object",
      properties: {
        name: {
          type: 123,
        },
      },
    }
    const path = await writeTempFile(JSON.stringify(descriptor), {
      format: "json",
    })

    const result = await validateDataSchemaTool.execute?.(
      {
        source: path,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.report.valid).toBe(false)
    expect(result.report.errors.length).toBeGreaterThan(0)
  })

  it("validates minimal valid descriptor", async () => {
    const descriptor: Descriptor = {
      type: "object",
      properties: {},
    }

    const result = await validateDataSchemaTool.execute?.(
      {
        source: descriptor,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.report.valid).toBe(true)
    expect(result.report.errors).toHaveLength(0)
  })

  it("validates schema with nested objects", async () => {
    const descriptor: Descriptor = {
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string" },
          },
        },
        settings: {
          type: "object",
          properties: {
            notifications: { type: "boolean" },
          },
        },
      },
    }

    const result = await validateDataSchemaTool.execute?.(
      {
        source: descriptor,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.report.valid).toBe(true)
    expect(result.report.errors).toHaveLength(0)
  })

  it("validates schema with array types", async () => {
    const descriptor: Descriptor = {
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
    }

    const result = await validateDataSchemaTool.execute?.(
      {
        source: descriptor,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.report.valid).toBe(true)
    expect(result.report.errors).toHaveLength(0)
  })
})
