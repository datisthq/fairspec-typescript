import { describe, expect, it } from "vite-plus/test"
import { loadSqliteTable } from "../load.ts"

describe("loadSqliteTable", () => {
  it("throws error when resource path is not defined", async () => {
    await expect(
      loadSqliteTable({
        fileDialect: { format: "sqlite", tableName: "fairspec" },
      }),
    ).rejects.toThrow("Resource path is not defined")
  })
})
