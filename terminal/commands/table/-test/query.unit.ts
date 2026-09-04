import { writeTempFile } from "@fairspec/library"
import { Command } from "commander"
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"
import { queryTableCommand } from "./query.ts"

describe("table query", () => {
  beforeEach(() => {
    vi.spyOn(process, "exit").mockImplementation((() => {}) as () => never)
    vi.spyOn(process.stdout, "write").mockImplementation(() => true)
    vi.spyOn(process.stderr, "write").mockImplementation(() => true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should query a table with SELECT statement", async () => {
    const csvContent = "id,name,age\n1,alice,25\n2,bob,30\n3,carol,28"
    const csvPath = await writeTempFile(csvContent, { format: "csv" })

    const text: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((msg: string | Uint8Array) => {
      text.push(typeof msg === "string" ? msg : msg.toString())
      return true
    })

    const command = new Command().addCommand(queryTableCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync([
        "node",
        "test",
        "query",
        csvPath,
        "SELECT * FROM self WHERE age > 25",
        "--json",
      ])
    } catch {}

    expect(text.length).toBeGreaterThan(0)
    const data = JSON.parse(text[0] ?? "")
    expect(Array.isArray(data)).toBe(true)
  })

  it("should query table with column selection", async () => {
    const csvContent = "id,name,age,city\n1,alice,25,NYC\n2,bob,30,LA\n3,carol,28,SF"
    const csvPath = await writeTempFile(csvContent, { format: "csv" })

    const text: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((msg: string | Uint8Array) => {
      text.push(typeof msg === "string" ? msg : msg.toString())
      return true
    })

    const command = new Command().addCommand(queryTableCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync([
        "node",
        "test",
        "query",
        csvPath,
        "SELECT name, city FROM self",
        "--json",
      ])
    } catch {}

    expect(text.length).toBeGreaterThan(0)
    const data = JSON.parse(text[0] ?? "")
    expect(Array.isArray(data)).toBe(true)
  })

  it("should query table with ORDER BY clause", async () => {
    const csvContent = "id,name,score\n1,alice,85\n2,bob,90\n3,carol,88"
    const csvPath = await writeTempFile(csvContent, { format: "csv" })

    const text: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((msg: string | Uint8Array) => {
      text.push(typeof msg === "string" ? msg : msg.toString())
      return true
    })

    const command = new Command().addCommand(queryTableCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync([
        "node",
        "test",
        "query",
        csvPath,
        "SELECT * FROM self ORDER BY score DESC",
        "--json",
      ])
    } catch {}

    expect(text.length).toBeGreaterThan(0)
    const data = JSON.parse(text[0] ?? "")
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
  })
})
