import { getTempFilePath } from "@fairspec/dataset"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { loadArrowTable } from "../load.ts"
import { saveArrowTable } from "../save.ts"

describe("saveArrowTable", () => {
  it("should save table to Arrow file", async () => {
    const path = getTempFilePath()
    const source = pl
      .DataFrame({
        id: [1.0, 2.0, 3.0],
        name: ["Alice", "Bob", "Charlie"],
      })
      .lazy()

    await saveArrowTable(source, { path })

    const table = await loadArrowTable({ data: path })
    expect((await table.collect()).toRecords()).toEqual([
      { id: 1.0, name: "Alice" },
      { id: 2.0, name: "Bob" },
      { id: 3.0, name: "Charlie" },
    ])
  })

  it("should save and load various data types", async () => {
    const path = getTempFilePath()

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

    await saveArrowTable(source, { path })

    const target = await loadArrowTable({ data: path }, { denormalized: true })
    expect((await target.collect()).toRecords()).toEqual([
      {
        boolean: true,
        date: "2025-01-01",
        datetime: new Date(Date.UTC(2025, 0, 1)),
        integer: 1,
        number: 1.1,
        string: "string",
      },
    ])
  })
})
