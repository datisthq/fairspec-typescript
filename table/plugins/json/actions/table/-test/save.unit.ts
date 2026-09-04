import { readFile } from "node:fs/promises"
import { getTempFilePath } from "@fairspec/dataset"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { loadJsonTable } from "../load.ts"
import { saveJsonTable } from "../save.ts"

const row1 = { id: 1, name: "english" }
const row2 = { id: 2, name: "中文" }
const table = pl.readRecords([row1, row2]).lazy()

describe("saveJsonTable", () => {
  it("should save table to file", async () => {
    const path = getTempFilePath()
    await saveJsonTable(table, { path, fileDialect: { format: "json" } })

    const content = await readFile(path, "utf-8")
    expect(content).toEqual(JSON.stringify([row1, row2], null, 2))
  })

  it("should handle property", async () => {
    const path = getTempFilePath()

    await saveJsonTable(table, {
      path,
      fileDialect: { format: "json", jsonPointer: "key" },
    })

    const content = await readFile(path, "utf-8")
    expect(content).toEqual(JSON.stringify({ key: [row1, row2] }, null, 2))
  })

  it("should handle item keys", async () => {
    const path = getTempFilePath()

    await saveJsonTable(table, {
      path,
      fileDialect: { format: "json", columnNames: ["name"] },
    })

    const content = await readFile(path, "utf-8")
    expect(content).toEqual(
      JSON.stringify([{ name: row1.name }, { name: row2.name }], null, 2),
    )
  })

  it("should handle item type (array)", async () => {
    const path = getTempFilePath()

    await saveJsonTable(table, {
      path,
      fileDialect: { format: "json", rowType: "array" },
    })

    const content = await readFile(path, "utf-8")
    expect(content).toEqual(
      JSON.stringify(
        [Object.keys(row1), Object.values(row1), Object.values(row2)],
        null,
        2,
      ),
    )
  })

  it("should save and load various data types", async () => {
    const path = getTempFilePath({ format: "json" })

    const source = pl
      .DataFrame([
        pl.Series("boolean", [true], pl.Bool),
        pl.Series("date", [new Date(Date.UTC(2025, 0, 1))], pl.Date),
        pl.Series("datetime", [new Date(Date.UTC(2025, 0, 1))], pl.Datetime),
        pl.Series("integer", [1], pl.Int32),
        pl.Series("list", [[1.0, 2.0, 3.0]], pl.List(pl.Float32)),
        pl.Series("number", [1.1], pl.Float64),
        pl.Series("string", ["string"], pl.String),
      ])
      .lazy()

    await saveJsonTable(source, { path })

    const target = await loadJsonTable({ data: path }, { denormalized: true })
    expect((await target.collect()).toRecords()).toEqual([
      {
        boolean: true,
        date: "2025-01-01",
        datetime: "2025-01-01T00:00:00",
        integer: 1,
        list: [1.0, 2.0, 3.0],
        number: 1.1,
        string: "string",
      },
    ])
  })
})

describe("saveJsonTable (format=jsonl)", () => {
  it("should save table to file", async () => {
    const path = getTempFilePath()

    await saveJsonTable(table, { path, fileDialect: { format: "jsonl" } })

    const content = await readFile(path, "utf-8")
    expect(content).toEqual([JSON.stringify(row1), JSON.stringify(row2)].join("\n"))
  })

  it("should handle item keys", async () => {
    const path = getTempFilePath()
    await saveJsonTable(table, {
      path,
      fileDialect: { format: "jsonl", columnNames: ["name"] },
    })

    const content = await readFile(path, "utf-8")
    expect(content).toEqual(
      [JSON.stringify({ name: row1.name }), JSON.stringify({ name: row2.name })].join(
        "\n",
      ),
    )
  })

  it("should handle item type (array)", async () => {
    const path = getTempFilePath()
    await saveJsonTable(table, {
      path,
      fileDialect: { format: "jsonl", rowType: "array" },
    })

    const content = await readFile(path, "utf-8")
    expect(content).toEqual(
      [
        JSON.stringify(Object.keys(row1)),
        JSON.stringify(Object.values(row1)),
        JSON.stringify(Object.values(row2)),
      ].join("\n"),
    )
  })

  it("should handle item type (object)", async () => {
    const path = getTempFilePath()
    await saveJsonTable(table, {
      path,
      fileDialect: { format: "jsonl", rowType: "object" },
    })

    const content = await readFile(path, "utf-8")
    expect(content).toEqual([JSON.stringify(row1), JSON.stringify(row2)].join("\n"))
  })
})
