import { writeTempFile } from "@fairspec/library"
import { Command } from "commander"
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"
import { inferDataSchemaCommand } from "./infer.ts"

describe("dataSchema infer", () => {
  beforeEach(() => {
    vi.spyOn(process, "exit").mockImplementation((() => {}) as () => never)
    vi.spyOn(process.stdout, "write").mockImplementation(() => true)
    vi.spyOn(process.stderr, "write").mockImplementation(() => true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should infer schema from simple JSON object", async () => {
    const jsonData = { name: "alice", age: 25, active: true }
    const jsonPath = await writeTempFile(JSON.stringify(jsonData), {
      format: "json",
    })

    const text: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((msg: string | Uint8Array) => {
      text.push(typeof msg === "string" ? msg : msg.toString())
      return true
    })

    const command = new Command().addCommand(inferDataSchemaCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync(["node", "test", "infer", jsonPath, "--json"])
    } catch {}

    expect(text.length).toBeGreaterThan(0)
    const data = JSON.parse(text[0] ?? "")
    expect(data).toHaveProperty("type")
    expect(data).toHaveProperty("properties")
  })

  it("should infer schema from JSON with multiple properties", async () => {
    const jsonData = {
      id: 1,
      name: "alice",
      email: "alice@example.com",
      age: 25,
      tags: ["admin", "user"],
    }
    const jsonPath = await writeTempFile(JSON.stringify(jsonData), {
      format: "json",
    })

    const text: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((msg: string | Uint8Array) => {
      text.push(typeof msg === "string" ? msg : msg.toString())
      return true
    })

    const command = new Command().addCommand(inferDataSchemaCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync(["node", "test", "infer", jsonPath, "--json"])
    } catch {}

    expect(text.length).toBeGreaterThan(0)
    const data = JSON.parse(text[0] ?? "")
    expect(data).toHaveProperty("type")
    expect(data).toHaveProperty("properties")
  })

  it("should infer schema with nested objects", async () => {
    const jsonData = {
      user: {
        name: "alice",
        contact: { email: "alice@example.com", phone: "555-1234" },
      },
      metadata: { created: "2024-01-01", version: 1 },
    }
    const jsonPath = await writeTempFile(JSON.stringify(jsonData), {
      format: "json",
    })

    const text: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((msg: string | Uint8Array) => {
      text.push(typeof msg === "string" ? msg : msg.toString())
      return true
    })

    const command = new Command().addCommand(inferDataSchemaCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync(["node", "test", "infer", jsonPath, "--json"])
    } catch {}

    expect(text.length).toBeGreaterThan(0)
    const data = JSON.parse(text[0] ?? "")
    expect(data).toHaveProperty("type")
    expect(data).toHaveProperty("properties")
  })
})
