import type { Resource } from "@fairspec/metadata"
import { describe, expect, it } from "vite-plus/test"
import { loadInlineTable } from "../load.ts"

describe("loadInlineTable", () => {
  it("should throw on no data", async () => {
    const resource = { name: "test" }

    await expect(loadInlineTable(resource)).rejects.toThrow(
      "Resource data is not defined or tabular",
    )
  })

  it("should throw on bad data", async () => {
    const resource = { name: "test", data: "bad" }

    await expect(loadInlineTable(resource)).rejects.toThrow(
      "Resource data is not defined or tabular",
    )
  })

  it("should read table data", async () => {
    const resource: Resource = {
      name: "test",
      data: [
        { id: 1, name: "english" },
        { id: 2, name: "中文" },
      ],
    }

    const table = await loadInlineTable(resource)
    const frame = await table.collect()

    expect([
      { id: 1, name: "english" },
      { id: 2, name: "中文" },
    ]).toEqual(frame.toRecords())
  })

  it("should handle longer rows", async () => {
    const resource: Resource = {
      data: [
        { id: 1, name: "english" },
        { id: 2, name: "中文", extra: "bad" },
      ],
      tableSchema: {
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
        },
      },
    }

    const table = await loadInlineTable(resource)
    const frame = await table.collect()

    expect(frame.toRecords()).toEqual([
      { id: 1, name: "english" },
      { id: 2, name: "中文" },
    ])
  })

  it("should handle shorter rows", async () => {
    const resource: Resource = {
      name: "test",
      data: [{ id: 1, name: "english" }, { id: 2 }],
      tableSchema: {
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
        },
      },
    }

    const table = await loadInlineTable(resource)
    const frame = await table.collect()

    expect(frame.toRecords()).toEqual([
      { id: 1, name: "english" },
      { id: 2, name: null },
    ])
  })

  it("should handle various data types", async () => {
    const resource: Resource = {
      data: [
        {
          string: "string",
          number: 1,
          boolean: true,
          date: new Date("2025-01-01"),
          time: new Date("2025-01-01"),
          datetime: new Date("2025-01-01"),
        },
      ],
    }

    const table = await loadInlineTable(resource)
    const frame = await table.collect()

    expect([
      {
        string: "string",
        number: 1,
        boolean: true,
        date: new Date("2025-01-01"),
        time: new Date("2025-01-01"),
        datetime: new Date("2025-01-01"),
      },
    ]).toEqual(frame.toRecords())
  })

  it("should handle objects with shorter rows", async () => {
    const resource: Resource = {
      data: [{ id: 1, name: "english" }, { id: 2, name: "中文" }, { id: 3 }],
    }

    const table = await loadInlineTable(resource)
    const frame = await table.collect()

    expect([
      { id: 1, name: "english" },
      { id: 2, name: "中文" },
      { id: 3, name: null },
    ]).toEqual(frame.toRecords())
  })

  it("should handle objects with longer rows", async () => {
    const resource: Resource = {
      data: [
        { id: 1, name: "english" },
        { id: 2, name: "中文" },
        { id: 3, name: "german", extra: "extra" },
      ],
    }

    const table = await loadInlineTable(resource)
    const frame = await table.collect()

    expect([
      { id: 1, name: "english", extra: null },
      { id: 2, name: "中文", extra: null },
      { id: 3, name: "german", extra: "extra" },
    ]).toEqual(frame.toRecords())
  })
})
