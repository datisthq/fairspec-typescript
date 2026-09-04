import { describe, expect, it } from "vite-plus/test"
import { getBasePropertyType, getIsNullablePropertyType } from "../property.ts"

describe("getBasePropertyType", () => {
  it("should return the type for a string type", () => {
    expect(getBasePropertyType("string")).toBe("string")
  })

  it("should return the base type for [type, null]", () => {
    expect(getBasePropertyType(["string", "null"])).toBe("string")
  })

  it("should return the base type for [null, type]", () => {
    expect(getBasePropertyType(["null", "string"])).toBe("string")
  })
})

describe("getIsNullablePropertyType", () => {
  it("should return false for a string type", () => {
    expect(getIsNullablePropertyType("string")).toBe(false)
  })

  it("should return true for [type, null]", () => {
    expect(getIsNullablePropertyType(["string", "null"])).toBe(true)
  })

  it("should return true for [null, type]", () => {
    expect(getIsNullablePropertyType(["null", "string"])).toBe(true)
  })

  it("should return false for undefined type", () => {
    expect(getIsNullablePropertyType(undefined)).toBe(false)
  })
})
