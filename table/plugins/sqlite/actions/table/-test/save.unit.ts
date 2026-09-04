import { getTempFilePath } from "@fairspec/dataset"
import type { SqliteFileDialect } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { loadSqliteTable } from "../load.ts"
import { saveSqliteTable } from "../save.ts"

const dialect: SqliteFileDialect = { format: "sqlite", tableName: "fairspec" }
const record1 = { id: 1, name: "english" }
const record2 = { id: 2, name: "中文" }

describe("saveSqliteTable", () => {
  it("should save/load table", async () => {
    const path = getTempFilePath()

    const source = pl.DataFrame([record1, record2]).lazy()
    await saveSqliteTable(source, {
      path,
      fileDialect: dialect,
      overwrite: true,
    })

    const target = await loadSqliteTable({ data: path, fileDialect: dialect })
    expect((await target.collect()).toRecords()).toEqual([record1, record2])
  })

  it("should save/load table with protocol", async () => {
    const path = `sqlite://${getTempFilePath()}`

    const source = pl.DataFrame([record1, record2]).lazy()
    await saveSqliteTable(source, {
      path,
      fileDialect: dialect,
      overwrite: true,
    })

    const target = await loadSqliteTable({ data: path, fileDialect: dialect })
    expect((await target.collect()).toRecords()).toEqual([record1, record2])
  })

  it("should save/load table with various data types", async () => {
    const path = `sqlite://${getTempFilePath()}`

    const source = pl
      .DataFrame([
        pl.Series("boolean", [true], pl.Bool),
        pl.Series("date", [new Date(Date.UTC(2025, 0, 1))], pl.Date),
        pl.Series("datetime", [new Date(Date.UTC(2025, 0, 1))], pl.Datetime),
        pl.Series("integer", [1], pl.Int32),
        pl.Series("number", [1.1], pl.Float64),
        pl.Series("string", ["string"], pl.String),
      ])
      .lazy()

    await saveSqliteTable(source, {
      path,
      fileDialect: dialect,
      overwrite: true,
    })

    const target = await loadSqliteTable(
      { data: path, fileDialect: dialect },
      { denormalized: true },
    )

    expect((await target.collect()).toRecords()).toEqual([
      {
        boolean: "true",
        date: "2025-01-01",
        datetime: "2025-01-01T00:00:00",
        integer: 1,
        number: 1.1,
        string: "string",
      },
    ])
  })
})
