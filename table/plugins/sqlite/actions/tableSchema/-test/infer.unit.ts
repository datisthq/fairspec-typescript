import { getTempFilePath } from "@fairspec/dataset"
import type { SqliteFileDialect } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { saveSqliteTable } from "../../../actions/table/save.ts"
import { inferTableSchemaFromSqlite } from "../infer.ts"

const fileDialect: SqliteFileDialect = {
  format: "sqlite",
  tableName: "fairspec",
}

describe("inferTableSchemaFromSqlite", () => {
  it("should infer schema", async () => {
    const path = getTempFilePath()

    const source = pl
      .DataFrame([
        pl.Series("string", ["string"], pl.Utf8),
        pl.Series("integer", [1], pl.Int32),
        pl.Series("number", [1.1], pl.Float64),
      ])
      .lazy()

    await saveSqliteTable(source, {
      path,
      fileDialect,
      overwrite: true,
    })

    const schema = await inferTableSchemaFromSqlite({
      data: path,
      fileDialect,
    })

    expect(schema).toEqual({
      required: [],
      primaryKey: undefined,
      properties: {
        string: { type: ["string", "null"] },
        integer: { type: ["integer", "null"] },
        number: { type: ["number", "null"] },
      },
    })
  })

  it("throws error when resource path is not defined", async () => {
    await expect(
      inferTableSchemaFromSqlite({
        fileDialect: { format: "sqlite", tableName: "fairspec" },
      }),
    ).rejects.toThrow("Database is not defined")
  })
})
