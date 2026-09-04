import { writeTempFile } from "@fairspec/dataset"
import type { Resource } from "@fairspec/metadata"
import { describe, expect, it } from "vite-plus/test"
import { inferTableSchema } from "../infer.ts"

describe("inferTableSchema", () => {
  it("should infer schema from CSV file", async () => {
    const path = await writeTempFile("id,name,age\n1,alice,25\n2,bob,30")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const tableSchema = await inferTableSchema(resource)
    expect(tableSchema).toEqual({
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        age: { type: "integer" },
      },
    })
  })

  it("should infer field types correctly", async () => {
    const path = await writeTempFile("id,name,score\n1,alice,95.5\n2,bob,87.3")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const tableSchema = await inferTableSchema(resource)
    expect(tableSchema).toEqual({
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        score: { type: "number" },
      },
    })
  })

  it("should infer schema from inline data", async () => {
    const resource: Resource = {
      data: [
        { id: 1, name: "alice" },
        { id: 2, name: "bob" },
      ],
    }

    const tableSchema = await inferTableSchema(resource)
    expect(tableSchema).toEqual({
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
      },
    })
  })

  it("should infer schema with custom delimiter", async () => {
    const path = await writeTempFile("id|name|value\n1|alice|100\n2|bob|200")
    const resource: Resource = {
      data: path,
      fileDialect: { format: "csv", delimiter: "|" },
    }

    const tableSchema = await inferTableSchema(resource)
    expect(tableSchema).toEqual({
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        value: { type: "integer" },
      },
    })
  })

  it("should handle boolean fields", async () => {
    const path = await writeTempFile("id,active\n1,true\n2,false")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const tableSchema = await inferTableSchema(resource)
    expect(tableSchema).toEqual({
      properties: {
        id: { type: "integer" },
        active: { type: "boolean" },
      },
    })
  })

  it("should handle date fields", async () => {
    const path = await writeTempFile("id,created\n1,2024-01-01\n2,2024-01-02")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const tableSchema = await inferTableSchema(resource)
    expect(tableSchema).toEqual({
      properties: {
        id: { type: "integer" },
        created: { type: "string", format: "date" },
      },
    })
  })

  it.skip("should handle mixed numeric types", async () => {
    const path = await writeTempFile("id,value\n1,100\n2,200.5")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const tableSchema = await inferTableSchema(resource)
    expect(tableSchema).toEqual({
      properties: {
        id: { type: "integer" },
        value: { type: "number" },
      },
    })
  })

  it("should infer schema from single row", async () => {
    const path = await writeTempFile("id,name\n1,alice")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const tableSchema = await inferTableSchema(resource)
    expect(tableSchema).toEqual({
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
      },
    })
  })

  it("should handle empty string values", async () => {
    const path = await writeTempFile("id,name,email\n1,alice,\n2,bob,bob@example.com")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const tableSchema = await inferTableSchema(resource)
    expect(tableSchema).toEqual({
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        email: { type: ["string", "null"], format: "email" },
      },
    })
  })

  it("should infer schema with sampleRows option", async () => {
    const path = await writeTempFile("id,name\n1,alice\n2,bob\n3,charlie\n4,david\n5,eve")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const tableSchema = await inferTableSchema(resource, { sampleRows: 2 })
    expect(tableSchema).toEqual({
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
      },
    })
  })

  it.skip("should handle resources with headers only", async () => {
    const path = await writeTempFile("id,name,age")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const tableSchema = await inferTableSchema(resource)
    expect(tableSchema).toEqual({
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        age: { type: "integer" },
      },
    })
  })

  it("should infer schema from complex inline data", async () => {
    const resource: Resource = {
      data: [
        {
          id: 1,
          name: "alice",
          score: 95.5,
          active: true,
          created: "2024-01-01",
        },
        {
          id: 2,
          name: "bob",
          score: 87.3,
          active: false,
          created: "2024-01-02",
        },
      ],
    }

    const tableSchema = await inferTableSchema(resource)
    expect(tableSchema).toEqual({
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        score: { type: "number" },
        active: { type: "boolean" },
        created: { type: "string", format: "date" },
      },
    })
  })
})
