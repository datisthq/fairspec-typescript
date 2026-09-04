import { readFile } from "node:fs/promises"
import { getTempFilePath } from "@fairspec/dataset"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { loadCsvTable } from "../load.ts"
import { saveCsvTable } from "../save.ts"

describe("saveCsvTable", () => {
  it("should save table to file", async () => {
    const path = getTempFilePath()
    const table = pl
      .DataFrame({
        id: [1.0, 2.0, 3.0],
        name: ["Alice", "Bob", "Charlie"],
      })
      .lazy()

    await saveCsvTable(table, { path, fileDialect: { format: "csv" } })

    const content = await readFile(path, "utf-8")
    expect(content).toEqual("id,name\n1.0,Alice\n2.0,Bob\n3.0,Charlie\n")
  })

  it("should save with custom delimiter", async () => {
    const path = getTempFilePath()
    const table = pl
      .DataFrame({
        id: [1.0, 2.0, 3.0],
        name: ["Alice", "Bob", "Charlie"],
      })
      .lazy()

    await saveCsvTable(table, {
      path,
      fileDialect: { format: "csv", delimiter: ";" },
    })

    const content = await readFile(path, "utf-8")
    expect(content).toEqual("id;name\n1.0;Alice\n2.0;Bob\n3.0;Charlie\n")
  })

  it("should save without header", async () => {
    const path = getTempFilePath()
    const table = pl
      .DataFrame({
        id: [1.0, 2.0, 3.0],
        name: ["Alice", "Bob", "Charlie"],
      })
      .lazy()

    await saveCsvTable(table, {
      path,
      fileDialect: { format: "csv", headerRows: false },
    })

    const content = await readFile(path, "utf-8")
    expect(content).toEqual("1.0,Alice\n2.0,Bob\n3.0,Charlie\n")
  })

  it("should save with custom quote char", async () => {
    const path = getTempFilePath()
    const table = pl
      .DataFrame({
        id: [1.0, 2.0, 3.0],
        name: ["Alice,Smith", "Bob,Jones", "Charlie,Brown"],
      })
      .lazy()

    await saveCsvTable(table, {
      path,
      fileDialect: { format: "csv", quoteChar: "'" },
    })

    const content = await readFile(path, "utf-8")
    expect(content).toEqual(
      "id,name\n1.0,'Alice,Smith'\n2.0,'Bob,Jones'\n3.0,'Charlie,Brown'\n",
    )
  })

  it("should save and load various data types", async () => {
    const path = getTempFilePath({ format: "csv" })

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

    await saveCsvTable(source, { path })

    const target = await loadCsvTable({ data: path }, { denormalized: true })
    expect((await target.collect()).toRecords()).toEqual([
      {
        boolean: "true",
        date: "2025-01-01",
        datetime: "2025-01-01T00:00:00",
        integer: "1",
        number: "1.1",
        string: "string",
      },
    ])
  })
})

describe("saveCsvTable (format=tsv)", () => {
  it("should save table to file", async () => {
    const path = getTempFilePath()
    const table = pl
      .DataFrame({
        id: [1.0, 2.0, 3.0],
        name: ["Alice", "Bob", "Charlie"],
      })
      .lazy()

    await saveCsvTable(table, { path, fileDialect: { format: "tsv" } })

    const content = await readFile(path, "utf-8")
    expect(content).toEqual("id\tname\n1.0\tAlice\n2.0\tBob\n3.0\tCharlie\n")
  })
})
