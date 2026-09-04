import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { normalizeTable } from "../normalize.ts"

describe("normalizeTable", () => {
  it("should work with schema", async () => {
    const table = pl
      .DataFrame({
        id: [1, 2],
        name: ["english", "中文"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
      },
    }

    const records = [
      { id: 1, name: "english" },
      { id: 2, name: "中文" },
    ]

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()
    expect(frame.toRecords()).toEqual(records)
  })

  it("should work with less fields in data", async () => {
    const table = pl
      .DataFrame({
        id: [1, 2],
        name: ["english", "中文"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        other: { type: "boolean" },
      },
    }

    const records = [
      { id: 1, name: "english", other: null },
      { id: 2, name: "中文", other: null },
    ]

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()
    expect(frame.toRecords()).toEqual(records)
  })

  it("should work with more fields in data", async () => {
    const table = pl
      .DataFrame({
        id: [1, 2],
        name: ["english", "中文"],
        other: [true, false],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
      },
    }

    const records = [
      { id: 1, name: "english" },
      { id: 2, name: "中文" },
    ]

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()
    expect(frame.toRecords()).toEqual(records)
  })

  it("should not work based on fields order", async () => {
    const table = pl
      .DataFrame({
        field1: [1, 2],
        field2: ["english", "中文"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
      },
    }

    const records = [
      { id: null, name: null },
      // TODO: review
      // { id: null, name: null },
    ]

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()
    expect(frame.toRecords()).toEqual(records)
  })

  it("should work based on field names (equal)", async () => {
    const table = pl
      .DataFrame({
        name: ["english", "中文"],
        id: [1, 2],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
      },
    }

    const records = [
      { id: 1, name: "english" },
      { id: 2, name: "中文" },
    ]

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()
    expect(frame.toRecords()).toEqual(records)
  })

  it("should work based on field names (subset)", async () => {
    const table = pl
      .DataFrame({
        name: ["english", "中文"],
        id: [1, 2],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
      },
    }

    const records = [
      { id: 1, name: "english" },
      { id: 2, name: "中文" },
    ]

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()
    expect(frame.toRecords()).toEqual(records)
  })

  it("should work based on field names (superset)", async () => {
    const table = pl
      .DataFrame({
        name: ["english", "中文"],
        id: [1, 2],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
      },
    }

    const records = [
      { id: 1, name: "english" },
      { id: 2, name: "中文" },
    ]

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()
    expect(frame.toRecords()).toEqual(records)
  })

  it("should work based on field names (partial)", async () => {
    const table = pl
      .DataFrame({
        name: ["english", "中文"],
        id: [1, 2],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
      },
    }

    const records = [
      { id: 1, name: "english" },
      { id: 2, name: "中文" },
    ]

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()
    expect(frame.toRecords()).toEqual(records)
  })

  it("should parse string columns", async () => {
    const table = pl
      .DataFrame({
        id: ["1", "2"],
        name: ["english", "中文"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
      },
    }

    const records = [
      { id: 1, name: "english" },
      { id: 2, name: "中文" },
    ]

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()
    expect(frame.toRecords()).toEqual(records)
  })

  it("should read type errors as nulls", async () => {
    const table = pl
      .DataFrame({
        id: [1, 2],
        name: ["english", "中文"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        id: { type: "integer" },
        name: { type: "integer" },
      },
    }

    const records = [
      { id: 1, name: null },
      { id: 2, name: null },
    ]

    const result = await normalizeTable(table, tableSchema)
    const frame = await result.collect()
    expect(frame.toRecords()).toEqual(records)
  })
})
