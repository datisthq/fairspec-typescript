import type { TableSchema } from "@fairspec/library"
import { writeTempFile } from "@fairspec/library"
import { Command } from "commander"
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"
import { validateTableSchemaCommand } from "./validate.ts"

describe("schema validate", () => {
  beforeEach(() => {
    vi.spyOn(process, "exit").mockImplementation((() => {}) as () => never)
    vi.spyOn(process.stdout, "write").mockImplementation(() => true)
    vi.spyOn(process.stderr, "write").mockImplementation(() => true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should validate a valid table schema", async () => {
    const schema: TableSchema = {
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
      },
    }
    const schemaPath = await writeTempFile(JSON.stringify(schema))

    const text: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((msg: string | Uint8Array) => {
      text.push(typeof msg === "string" ? msg : msg.toString())
      return true
    })

    const command = new Command().addCommand(validateTableSchemaCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync(["node", "test", "validate", schemaPath, "--json"])
    } catch {}

    expect(text.length).toBeGreaterThan(0)
    const data = JSON.parse(text[0] ?? "")
    expect(data).toHaveProperty("valid")
    expect(data.valid).toBe(true)
  })

  it("should detect invalid property structure", async () => {
    const schema = {
      properties: {
        id: "invalid-structure",
      },
    }
    const schemaPath = await writeTempFile(JSON.stringify(schema))

    const text: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((msg: string | Uint8Array) => {
      text.push(typeof msg === "string" ? msg : msg.toString())
      return true
    })

    const command = new Command().addCommand(validateTableSchemaCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync(["node", "test", "validate", schemaPath, "--json"])
    } catch {}

    expect(text.length).toBeGreaterThan(0)
    const data = JSON.parse(text[0] ?? "")
    expect(data).toHaveProperty("valid")
    expect(data.valid).toBe(false)
    expect(data.errors.length).toBeGreaterThan(0)
  })

  it("should detect invalid property types", async () => {
    const schema = {
      properties: {
        id: { type: "invalid-type" },
      },
    }
    const schemaPath = await writeTempFile(JSON.stringify(schema))

    const text: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((msg: string | Uint8Array) => {
      text.push(typeof msg === "string" ? msg : msg.toString())
      return true
    })

    const command = new Command().addCommand(validateTableSchemaCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync(["node", "test", "validate", schemaPath, "--json"])
    } catch {}

    expect(text.length).toBeGreaterThan(0)
    const data = JSON.parse(text[0] ?? "")
    expect(data).toHaveProperty("valid")
    expect(data.valid).toBe(false)
    expect(data.errors.length).toBeGreaterThan(0)
  })
})
