import type { Resource } from "@fairspec/library"
import { writeTempFile } from "@fairspec/library"
import { describe, expect, it } from "vite-plus/test"
import { queryTableTool } from "./query.ts"

describe("queryTableTool", () => {
  it("validates tool structure", () => {
    expect(queryTableTool.id).toBe("query-table")
    expect(queryTableTool.description).toBeTruthy()
    expect(queryTableTool.inputSchema).toBeTruthy()
    expect(queryTableTool.outputSchema).toBeTruthy()
    expect(queryTableTool.execute).toBeTypeOf("function")
  })

  it("queries table with SELECT statement", async () => {
    const csvContent = "id,name,age\n1,alice,25\n2,bob,30\n3,carol,28"
    const csvPath = await writeTempFile(csvContent, { format: "csv" })
    const resource: Resource = { data: csvPath, fileDialect: { format: "csv" } }

    const result = await queryTableTool.execute?.(
      {
        resource,
        query: "SELECT * FROM self WHERE age > 25",
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(Array.isArray(result.records)).toBe(true)
    expect(result.records.length).toBe(2)
    expect(result.records).toContainEqual({ id: 2, name: "bob", age: 30 })
    expect(result.records).toContainEqual({ id: 3, name: "carol", age: 28 })
  })

  it("queries table with column selection", async () => {
    const csvContent = "id,name,age,city\n1,alice,25,NYC\n2,bob,30,LA\n3,carol,28,SF"
    const csvPath = await writeTempFile(csvContent, { format: "csv" })
    const resource: Resource = { data: csvPath, fileDialect: { format: "csv" } }

    const result = await queryTableTool.execute?.(
      {
        resource,
        query: "SELECT name, city FROM self",
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(Array.isArray(result.records)).toBe(true)
    expect(result.records.length).toBe(3)
    expect(result.records[0]).toHaveProperty("name")
    expect(result.records[0]).toHaveProperty("city")
    expect(result.records[0]).not.toHaveProperty("id")
    expect(result.records[0]).not.toHaveProperty("age")
  })

  it("queries table with ORDER BY clause", async () => {
    const csvContent = "id,name,score\n1,alice,85\n2,bob,90\n3,carol,88"
    const csvPath = await writeTempFile(csvContent, { format: "csv" })
    const resource: Resource = { data: csvPath, fileDialect: { format: "csv" } }

    const result = await queryTableTool.execute?.(
      {
        resource,
        query: "SELECT * FROM self ORDER BY score DESC",
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(Array.isArray(result.records)).toBe(true)
    expect(result.records.length).toBe(3)
    expect(result.records[0]).toMatchObject({ name: "bob", score: 90 })
    expect(result.records[1]).toMatchObject({ name: "carol", score: 88 })
    expect(result.records[2]).toMatchObject({ name: "alice", score: 85 })
  })

  it("queries table with aggregation", async () => {
    const csvContent = "id,name,score\n1,alice,85\n2,bob,90\n3,carol,88"
    const csvPath = await writeTempFile(csvContent, { format: "csv" })
    const resource: Resource = { data: csvPath, fileDialect: { format: "csv" } }

    const result = await queryTableTool.execute?.(
      {
        resource,
        query: "SELECT COUNT(*) as count, AVG(score) as avg_score FROM self",
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(Array.isArray(result.records)).toBe(true)
    expect(result.records.length).toBe(1)
    expect(result.records[0]).toHaveProperty("count")
    expect(result.records[0]).toHaveProperty("avg_score")
  })

  it("queries table with WHERE and LIMIT", async () => {
    const csvContent =
      "id,name,age\n1,alice,25\n2,bob,30\n3,carol,28\n4,dave,35\n5,eve,22"
    const csvPath = await writeTempFile(csvContent, { format: "csv" })
    const resource: Resource = { data: csvPath, fileDialect: { format: "csv" } }

    const result = await queryTableTool.execute?.(
      {
        resource,
        query: "SELECT * FROM self WHERE age >= 25 ORDER BY age LIMIT 2",
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(Array.isArray(result.records)).toBe(true)
    expect(result.records.length).toBe(2)
  })

  it("queries inline data", async () => {
    const resource: Resource = {
      data: [
        { id: 1, name: "alice", score: 85 },
        { id: 2, name: "bob", score: 90 },
        { id: 3, name: "carol", score: 88 },
      ],
    }

    const result = await queryTableTool.execute?.(
      {
        resource,
        query: "SELECT name, score FROM self WHERE score > 85",
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(Array.isArray(result.records)).toBe(true)
    expect(result.records.length).toBe(2)
    expect(result.records).toContainEqual({ name: "bob", score: 90 })
    expect(result.records).toContainEqual({ name: "carol", score: 88 })
  })

  it("queries with JOIN operations", async () => {
    const resource: Resource = {
      data: [
        { id: 1, name: "alice", dept_id: 10 },
        { id: 2, name: "bob", dept_id: 20 },
      ],
    }

    const result = await queryTableTool.execute?.(
      {
        resource,
        query: "SELECT * FROM self WHERE dept_id = 10",
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(Array.isArray(result.records)).toBe(true)
    expect(result.records.length).toBe(1)
    expect(result.records[0]).toMatchObject({ name: "alice", dept_id: 10 })
  })

  it("returns all records when querying without filters", async () => {
    const csvContent = "id,name\n1,alice\n2,bob\n3,carol"
    const csvPath = await writeTempFile(csvContent, { format: "csv" })
    const resource: Resource = { data: csvPath, fileDialect: { format: "csv" } }

    const result = await queryTableTool.execute?.(
      {
        resource,
        query: "SELECT * FROM self",
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(Array.isArray(result.records)).toBe(true)
    expect(result.records.length).toBe(3)
  })
})
