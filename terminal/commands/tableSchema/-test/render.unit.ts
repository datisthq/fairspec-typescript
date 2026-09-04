import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import type { TableSchema } from "@fairspec/library"
import { getTempFilePath, writeTempFile } from "@fairspec/library"
import { Command } from "commander"
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"
import { renderTableSchemaCommand } from "./render.ts"

describe("schema render", () => {
  beforeEach(() => {
    vi.spyOn(process, "exit").mockImplementation((() => {}) as () => never)
    vi.spyOn(process.stdout, "write").mockImplementation(() => true)
    vi.spyOn(process.stderr, "write").mockImplementation(() => true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should render table schema as markdown", async () => {
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

    const command = new Command().addCommand(renderTableSchemaCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync([
        "node",
        "test",
        "render",
        schemaPath,
        "--to-format",
        "markdown",
        "--json",
      ])
    } catch {}

    expect(text.length).toBeGreaterThan(0)
    const data = JSON.parse(text[0] ?? "")
    expect(data).toHaveProperty("result")
    expect(data.result).toContain("id")
    expect(data.result).toContain("name")
  })

  it("should render table schema as HTML and save to file", async () => {
    const schema: TableSchema = {
      properties: {
        id: { type: "integer" },
        email: { type: "string", format: "email" },
      },
    }
    const schemaPath = await writeTempFile(JSON.stringify(schema))
    const outputPath = getTempFilePath()

    vi.spyOn(console, "log").mockImplementation(() => {})

    const command = new Command().addCommand(renderTableSchemaCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync([
        "node",
        "test",
        "render",
        schemaPath,
        "--to-format",
        "html",
        "--to-path",
        outputPath,
        "--json",
      ])
    } catch {}

    expect(existsSync(outputPath)).toBe(true)
    const content = await readFile(outputPath, "utf-8")
    expect(content).toContain("id")
    expect(content).toContain("email")
  })

  it("should render table schema as HTML to console", async () => {
    const schema: TableSchema = {
      properties: {
        age: { type: "integer" },
        active: { type: "boolean" },
      },
    }
    const schemaPath = await writeTempFile(JSON.stringify(schema))

    const text: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((msg: string | Uint8Array) => {
      text.push(typeof msg === "string" ? msg : msg.toString())
      return true
    })

    const command = new Command().addCommand(renderTableSchemaCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync([
        "node",
        "test",
        "render",
        schemaPath,
        "--to-format",
        "html",
        "--json",
      ])
    } catch {}

    expect(text.length).toBeGreaterThan(0)
    const data = JSON.parse(text[0] ?? "")
    expect(data).toHaveProperty("result")
    expect(data.result).toContain("age")
    expect(data.result).toContain("active")
  })
})
