import { describe, expect, it } from "vite-plus/test"
import { inferResourceName } from "../infer.ts"

describe("inferResourceName", () => {
  it("dont returns existing name when provided", () => {
    const resource = { name: "existing-name", data: "/data/users.csv" }
    expect(inferResourceName(resource)).toBe("users")
  })

  it("infers name from single string path", () => {
    const resource = { data: "/data/users.csv" }
    expect(inferResourceName(resource)).toBe("users")
  })

  it("infers name from first path in array", () => {
    const resource = { data: ["/data/users.csv", "/data/backup.csv"] }
    expect(inferResourceName(resource)).toBe("users")
  })

  it("infers name from URL path", () => {
    const resource = { data: "https://example.com/data/products.json" }
    expect(inferResourceName(resource)).toBe("products")
  })

  it("returns default name when no path or name", () => {
    const resource = {}
    expect(inferResourceName(resource)).toBe("resource")
  })

  it("returns default name when path has no filename", () => {
    const resource = { data: "/data/folder/" }
    expect(inferResourceName(resource)).toBe("resource")
  })

  it("handles complex filename with multiple dots", () => {
    const resource = { data: "/data/file.backup.csv" }
    expect(inferResourceName(resource)).toBe("file_backup")
  })

  it("slugifies filename with spaces and special characters", () => {
    const resource = { data: "/data/My Data File!.csv" }
    expect(inferResourceName(resource)).toBe("my_data_file")
  })
})
