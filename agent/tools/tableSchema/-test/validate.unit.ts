import type { Descriptor } from "@fairspec/library"
import { writeTempFile } from "@fairspec/library"
import { describe, expect, it } from "vite-plus/test"
import { validateTableSchemaTool } from "./validate.ts"

describe("validateTableSchemaTool", () => {
  it("validates tool structure", () => {
    expect(validateTableSchemaTool.id).toBe("validate-table-schema")
    expect(validateTableSchemaTool.description).toBeTruthy()
    expect(validateTableSchemaTool.inputSchema).toBeTruthy()
    expect(validateTableSchemaTool.outputSchema).toBeTruthy()
    expect(validateTableSchemaTool.execute).toBeTypeOf("function")
  })

  it("validates a valid table schema descriptor", async () => {
    const descriptor: Descriptor = {
      properties: {
        id: { type: "integer" as const },
        name: { type: "string" as const },
      },
    }

    const result = await validateTableSchemaTool.execute?.(
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

  it("detects invalid table schema", async () => {
    const descriptor: Descriptor = {
      properties: {
        id: {
          type: 123 as unknown as "integer",
        },
      },
    }

    const result = await validateTableSchemaTool.execute?.(
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

  it("validates table schema from file path", async () => {
    const descriptor = {
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        age: { type: "integer" },
      },
    }
    const path = await writeTempFile(JSON.stringify(descriptor), {
      format: "json",
    })

    const result = await validateTableSchemaTool.execute?.(
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

  it("detects invalid table schema from file path", async () => {
    const descriptor = {
      properties: {
        id: {
          type: "not-a-valid-type",
        },
      },
    }
    const path = await writeTempFile(JSON.stringify(descriptor), {
      format: "json",
    })

    const result = await validateTableSchemaTool.execute?.(
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
      properties: {},
    }

    const result = await validateTableSchemaTool.execute?.(
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

  it("validates schema with field constraints", async () => {
    const descriptor: Descriptor = {
      properties: {
        id: {
          type: "integer" as const,
          constraints: {
            required: true,
            minimum: 1,
          },
        },
        email: {
          type: "string" as const,
          format: "email" as const,
          constraints: {
            required: true,
          },
        },
      },
    }

    const result = await validateTableSchemaTool.execute?.(
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
