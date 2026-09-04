import { writeTempFile } from "@fairspec/library"
import { Command } from "commander"
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"
import { inferDatasetCommand } from "./infer.ts"

describe("dataset infer", () => {
  beforeEach(() => {
    vi.spyOn(process, "exit").mockImplementation((() => {}) as () => never)
    vi.spyOn(process.stdout, "write").mockImplementation(() => true)
    vi.spyOn(process.stderr, "write").mockImplementation(() => true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should infer a dataset from a single CSV file", async () => {
    const csvPath = await writeTempFile("id,name\n1,alice\n2,bob", {
      format: "csv",
    })

    const text: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((msg: string | Uint8Array) => {
      text.push(typeof msg === "string" ? msg : msg.toString())
      return true
    })

    const command = new Command().addCommand(inferDatasetCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync(["node", "test", "infer", csvPath, "--json"])
    } catch {}

    expect(text.length).toBeGreaterThan(0)
    const data = JSON.parse(text[0] ?? "")
    expect(data).toHaveProperty("resources")
    expect(data.resources).toHaveLength(1)
    expect(data.resources[0]).toHaveProperty("data")
  })

  it("should infer a dataset from multiple files", async () => {
    const csv1Path = await writeTempFile("id,name\n1,alice", {
      format: "csv",
    })
    const csv2Path = await writeTempFile("id,age\n1,25", { format: "csv" })

    const text: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((msg: string | Uint8Array) => {
      text.push(typeof msg === "string" ? msg : msg.toString())
      return true
    })

    const command = new Command().addCommand(inferDatasetCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync(["node", "test", "infer", csv1Path, csv2Path, "--json"])
    } catch {}

    expect(text.length).toBeGreaterThan(0)
    const data = JSON.parse(text[0] ?? "")
    expect(data).toHaveProperty("resources")
    expect(data.resources).toHaveLength(2)
  })

  it("should infer a dataset with format information", async () => {
    const csvPath = await writeTempFile("id,name,age\n1,alice,25\n2,bob,30", {
      format: "csv",
    })

    const text: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((msg: string | Uint8Array) => {
      text.push(typeof msg === "string" ? msg : msg.toString())
      return true
    })

    const command = new Command().addCommand(inferDatasetCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync(["node", "test", "infer", csvPath, "--json"])
    } catch {}

    expect(text.length).toBeGreaterThan(0)
    const data = JSON.parse(text[0] ?? "")
    expect(data).toHaveProperty("resources")
    expect(data.resources[0]).toHaveProperty("fileDialect")
  })
})
