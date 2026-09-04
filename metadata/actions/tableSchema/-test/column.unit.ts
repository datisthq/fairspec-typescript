import { describe, expect, it } from "vite-plus/test"
import { getColumns } from "../column.ts"

describe("getColumns", () => {
  it("should set required for columns listed in required", () => {
    const columns = getColumns({
      required: ["id"],
      properties: {
        id: { type: "number" },
        name: { type: "string" },
      },
    })

    const id = columns.find(c => c.name === "id")
    const name = columns.find(c => c.name === "name")
    expect(id?.required).toBe(true)
    expect(name?.required).toBeFalsy()
  })

  it("should set required for all columns with allRequired", () => {
    const columns = getColumns({
      allRequired: true,
      properties: {
        id: { type: "number" },
        name: { type: "string" },
      },
    })

    expect(columns.every(c => c.required === true)).toBe(true)
  })

  it("should set nullable for nullable types", () => {
    const columns = getColumns({
      properties: {
        id: { type: ["number", "null"] as const },
      },
    })

    expect(columns).toHaveLength(1)
    expect(columns).toContainEqual(
      expect.objectContaining({ name: "id", nullable: true }),
    )
  })

  it("should set both required and nullable with allRequired and nullable type", () => {
    const columns = getColumns({
      allRequired: true,
      properties: {
        id: { type: ["number", "null"] as const },
      },
    })

    expect(columns).toHaveLength(1)
    expect(columns).toContainEqual(
      expect.objectContaining({ name: "id", required: true, nullable: true }),
    )
  })
})
