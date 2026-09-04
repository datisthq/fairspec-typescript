import { writeTempFile } from "@fairspec/library"
import { Command } from "commander"
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"
import { describeFileCommand } from "./describe.ts"

describe("file describe", () => {
  beforeEach(() => {
    vi.spyOn(process, "exit").mockImplementation((() => {}) as () => never)
    vi.spyOn(process.stdout, "write").mockImplementation(() => true)
    vi.spyOn(process.stderr, "write").mockImplementation(() => true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should describe a text file", async () => {
    const filePath = await writeTempFile("test content", { format: "txt" })

    const text: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((msg: string | Uint8Array) => {
      text.push(typeof msg === "string" ? msg : msg.toString())
      return true
    })

    const command = new Command().addCommand(describeFileCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync(["node", "test", "describe", filePath, "--json"])
    } catch {}

    expect(text.length).toBeGreaterThan(0)
    const data = JSON.parse(text[0] ?? "")
    expect(data).toHaveProperty("bytes")
    expect(data).toHaveProperty("integrity")
    expect(data.bytes).toBe(12)
  })

  it("should describe a CSV file with hash", async () => {
    const csvContent = "id,name\n1,alice\n2,bob"
    const filePath = await writeTempFile(csvContent, { format: "csv" })

    const text: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((msg: string | Uint8Array) => {
      text.push(typeof msg === "string" ? msg : msg.toString())
      return true
    })

    const command = new Command().addCommand(describeFileCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync([
        "node",
        "test",
        "describe",
        filePath,
        "--hash-type",
        "md5",
        "--json",
      ])
    } catch {}

    expect(text.length).toBeGreaterThan(0)
    const data = JSON.parse(text[0] ?? "")
    expect(data).toHaveProperty("bytes")
    expect(data).toHaveProperty("integrity")
    expect(data.bytes).toBeGreaterThan(0)
  })

  it("should describe a JSON file", async () => {
    const jsonContent = JSON.stringify({ id: 1, name: "test", value: 100 })
    const filePath = await writeTempFile(jsonContent, { format: "json" })

    const text: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((msg: string | Uint8Array) => {
      text.push(typeof msg === "string" ? msg : msg.toString())
      return true
    })

    const command = new Command().addCommand(describeFileCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync(["node", "test", "describe", filePath, "--json"])
    } catch {}

    expect(text.length).toBeGreaterThan(0)
    const data = JSON.parse(text[0] ?? "")
    expect(data).toHaveProperty("bytes")
    expect(data).toHaveProperty("integrity")
    expect(data.bytes).toBeGreaterThan(0)
  })
})
