import { describe, expect, it } from "vite-plus/test"
import { createColumnFromProperty } from "../create.ts"

describe("createColumnFromProperty", () => {
  it("should create a column with string type", () => {
    const column = createColumnFromProperty("name", { type: "string" })
    expect(column.type).toBe("string")
    expect(column.nullable).toBeUndefined()
  })

  it("should create a nullable column for [type, null]", () => {
    const column = createColumnFromProperty("name", {
      type: ["string", "null"] as const,
    })
    expect(column.type).toBe("string")
    expect(column.nullable).toBe(true)
  })

  it("should create a nullable column for [null, type]", () => {
    const column = createColumnFromProperty("name", {
      type: ["null", "string"] as const,
    })
    expect(column.type).toBe("string")
    expect(column.nullable).toBe(true)
  })

  it("should create a nullable date column for [type, null] with format", () => {
    const column = createColumnFromProperty("created", {
      type: ["string", "null"] as const,
      format: "date",
    })
    expect(column.type).toBe("date")
    expect(column.nullable).toBe(true)
  })
})
