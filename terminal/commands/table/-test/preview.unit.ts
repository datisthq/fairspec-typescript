import { writeTempFile } from "@fairspec/library"
import { Command } from "commander"
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"
import { previewTableCommand } from "./preview.ts"

describe("table preview", () => {
  beforeEach(() => {
    vi.spyOn(process, "exit").mockImplementation((() => {}) as () => never)
    vi.spyOn(process.stdout, "write").mockImplementation(() => true)
    vi.spyOn(process.stderr, "write").mockImplementation(() => true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should preview local CSV file", async () => {
    const csvContent = "id,name\n1,english\n2,中文"
    const csvPath = await writeTempFile(csvContent, { format: "csv" })

    const text: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((msg: string | Uint8Array) => {
      text.push(typeof msg === "string" ? msg : msg.toString())
      return true
    })

    const command = new Command().addCommand(previewTableCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync(["node", "test", "preview", csvPath, "--json"])
    } catch {}

    expect(text.length).toBeGreaterThan(0)
    const data = JSON.parse(text[0] ?? "")
    expect(Array.isArray(data)).toBe(true)
    expect(data).toEqual([
      { id: 1, name: "english" },
      { id: 2, name: "中文" },
    ])
  })

  it("should preview local CSV file with JSON output", async () => {
    const csvContent = "id,name,age\n1,alice,25\n2,bob,30\n3,carol,28"
    const csvPath = await writeTempFile(csvContent, { format: "csv" })

    const text: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((msg: string | Uint8Array) => {
      text.push(typeof msg === "string" ? msg : msg.toString())
      return true
    })

    const command = new Command().addCommand(previewTableCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync(["node", "test", "preview", csvPath, "--json"])
    } catch {}

    expect(text.length).toBeGreaterThan(0)
    const data = JSON.parse(text[0] ?? "")
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBe(3)
  })

  it("should preview with custom delimiter", async () => {
    const csvContent = "id|name|age\n1|alice|25\n2|bob|30"
    const csvPath = await writeTempFile(csvContent, { format: "csv" })

    const text: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((msg: string | Uint8Array) => {
      text.push(typeof msg === "string" ? msg : msg.toString())
      return true
    })

    const command = new Command().addCommand(previewTableCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync([
        "node",
        "test",
        "preview",
        csvPath,
        "--delimiter",
        "|",
        "--json",
      ])
    } catch {}

    expect(text.length).toBeGreaterThan(0)
    const data = JSON.parse(text[0] ?? "")
    expect(Array.isArray(data)).toBe(true)
    expect(data).toEqual([
      { id: 1, name: "alice", age: 25 },
      { id: 2, name: "bob", age: 30 },
    ])
  })

  it("should preview small file completely", async () => {
    const csvContent = "id,name\n1,test"
    const csvPath = await writeTempFile(csvContent, { format: "csv" })

    const text: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((msg: string | Uint8Array) => {
      text.push(typeof msg === "string" ? msg : msg.toString())
      return true
    })

    const command = new Command().addCommand(previewTableCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync(["node", "test", "preview", csvPath, "--json"])
    } catch {}

    expect(text.length).toBeGreaterThan(0)
    const data = JSON.parse(text[0] ?? "")
    expect(Array.isArray(data)).toBe(true)
    expect(data).toEqual([{ id: 1, name: "test" }])
  })
})
