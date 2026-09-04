import type { Resource } from "@fairspec/metadata"
import { describe, expect, it } from "vite-plus/test"
import { validateData } from "../validate.ts"

describe("validateData", () => {
  it("should validate data against schema", async () => {
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

    const report = await validateData(resource)
    expect(report.valid).toBe(true)
    expect(report.errors).toHaveLength(0)
  })

  it("should return errors for invalid data", async () => {
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

    const report = await validateData(resource)
    expect(report.valid).toBe(false)
    expect(report.errors).toHaveLength(2)
    expect(report.errors).toContainEqual({
      type: "data",
      jsonPointer: "/name",
      message: "must be string",
    })
    expect(report.errors).toContainEqual({
      type: "data",
      jsonPointer: "/count",
      message: "must be integer",
    })
  })

  it("should return error when no data but schema expected", async () => {
    const resource: Resource = {
      name: "empty",
      dataSchema: { type: "object" },
    }

    const report = await validateData(resource)
    expect(report.valid).toBe(false)
    expect(report.errors).toHaveLength(1)
    expect(report.errors).toContainEqual({
      type: "resource/type",
      expectedResourceType: "data",
    })
  })
})
