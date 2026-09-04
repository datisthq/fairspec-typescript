import type { Resource } from "@fairspec/library"
import { writeTempFile } from "@fairspec/library"
import { describe, expect, it } from "vite-plus/test"
import { inferTableSchemaTool } from "./infer.ts"

describe("inferTableSchemaTool", () => {
  it("validates tool structure", () => {
    expect(inferTableSchemaTool.id).toBe("infer-table-schema")
    expect(inferTableSchemaTool.description).toBeTruthy()
    expect(inferTableSchemaTool.inputSchema).toBeTruthy()
    expect(inferTableSchemaTool.outputSchema).toBeTruthy()
    expect(inferTableSchemaTool.execute).toBeTypeOf("function")
  })

  it("infers schema from CSV file", async () => {
    const path = await writeTempFile("id,name,age\n1,alice,30\n2,bob,25")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const result = await inferTableSchemaTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.tableSchema?.properties).toBeDefined()
    expect(result.tableSchema?.properties?.id?.type).toBe("integer")
    expect(result.tableSchema?.properties?.name?.type).toBe("string")
    expect(result.tableSchema?.properties?.age?.type).toBe("integer")
  })

  it("infers schema from inline object data", async () => {
    const resource: Resource = {
      data: [
        { id: 1, name: "alice", age: 30 },
        { id: 2, name: "bob", age: 25 },
      ],
    }

    const result = await inferTableSchemaTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.tableSchema?.properties).toBeDefined()
    expect(result.tableSchema?.properties?.id?.type).toBe("integer")
    expect(result.tableSchema?.properties?.name?.type).toBe("string")
    expect(result.tableSchema?.properties?.age?.type).toBe("integer")
  })

  it("infers different field types correctly", async () => {
    const resource: Resource = {
      data: [
        { id: 1, name: "alice", score: 95.5, active: true },
        { id: 2, name: "bob", score: 87.3, active: false },
      ],
    }

    const result = await inferTableSchemaTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.tableSchema?.properties).toBeDefined()
    expect(result.tableSchema?.properties?.id?.type).toBe("integer")
    expect(result.tableSchema?.properties?.name?.type).toBe("string")
    expect(result.tableSchema?.properties?.score?.type).toBe("number")
    expect(result.tableSchema?.properties?.active?.type).toBe("boolean")
  })

  it("infers date fields from strings", async () => {
    const resource: Resource = {
      data: [
        { id: 1, name: "alice", created: "2024-01-01" },
        { id: 2, name: "bob", created: "2024-01-02" },
      ],
    }

    const result = await inferTableSchemaTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.tableSchema?.properties).toBeDefined()
    expect(result.tableSchema?.properties?.id?.type).toBe("integer")
    expect(result.tableSchema?.properties?.name?.type).toBe("string")
    expect(result.tableSchema?.properties?.created?.type).toBe("string")
    expect(result.tableSchema?.properties?.created?.format).toBe("date")
  })

  it("respects sampleRows option", async () => {
    const resource: Resource = {
      data: Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `user${i}`,
      })),
    }

    const result = await inferTableSchemaTool.execute?.(
      {
        resource,
        options: { sampleRows: 10 },
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.tableSchema?.properties).toBeDefined()
    expect(result.tableSchema?.properties?.id?.type).toBe("integer")
    expect(result.tableSchema?.properties?.name?.type).toBe("string")
  })

  it("handles empty data", async () => {
    const resource: Resource = {
      data: [],
    }

    const result = await inferTableSchemaTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))
    expect(result.tableSchema).toBeUndefined()
  })

  it("handles single row data", async () => {
    const resource: Resource = {
      data: [{ id: 1, name: "alice" }],
    }

    const result = await inferTableSchemaTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.tableSchema?.properties).toBeDefined()
    expect(result.tableSchema?.properties?.id?.type).toBe("integer")
    expect(result.tableSchema?.properties?.name?.type).toBe("string")
  })

  it("respects columnTypes option", async () => {
    const resource: Resource = {
      data: [
        { id: "123", value: "456" },
        { id: "789", value: "012" },
      ],
    }

    const result = await inferTableSchemaTool.execute?.(
      {
        resource,
        options: { columnTypes: { id: "integer", value: "integer" } },
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.tableSchema?.properties).toBeDefined()
    expect(result.tableSchema?.properties?.id?.type).toBe("integer")
    expect(result.tableSchema?.properties?.value?.type).toBe("integer")
  })

  it("handles time fields", async () => {
    const resource: Resource = {
      data: [
        { id: 1, time: "14:30:00" },
        { id: 2, time: "09:15:30" },
      ],
    }

    const result = await inferTableSchemaTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.tableSchema?.properties).toBeDefined()
    expect(result.tableSchema?.properties?.id?.type).toBe("integer")
    expect(result.tableSchema?.properties?.time?.type).toBe("string")
    expect(result.tableSchema?.properties?.time?.format).toBe("time")
  })
})
