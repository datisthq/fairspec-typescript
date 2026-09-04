import { describe, expect, it } from "vite-plus/test"
import { validateTableSchema } from "../validate.ts"

describe("validateTableSchema", () => {
  it("returns no errors for valid schema", async () => {
    const descriptor = {
      properties: {
        id: {
          type: "integer",
        },
        name: {
          type: "string",
        },
      },
    }

    const report = await validateTableSchema(descriptor)

    console.log(report)

    expect(report.valid).toBe(true)
    expect(report.errors).toEqual([])
  })

  it("returns validation errors for invalid schema", async () => {
    const descriptor = {
      properties: {
        id: {
          type: 123,
        },
      },
    }

    const report = await validateTableSchema(descriptor)

    console.log(report)

    expect(report.valid).toBe(false)
    expect(report.errors.length).toBeGreaterThan(0)
  })

  it("returns valid if missing $schema", async () => {
    const descriptor = {
      properties: {
        id: {
          type: "integer",
        },
      },
    }

    const report = await validateTableSchema(descriptor)
    expect(report.valid).toBe(true)
  })

  it("throws error for invalid $schema URL", async () => {
    const descriptor = {
      $schema: "https://fairspec.org/profiles/latest/dataset.json",
      properties: {
        id: {
          type: "integer",
        },
      },
    }

    await expect(validateTableSchema(descriptor)).rejects.toThrow(
      "Profile at path https://fairspec.org/profiles/latest/dataset.json is not a valid table-schema profile",
    )
  })
})
