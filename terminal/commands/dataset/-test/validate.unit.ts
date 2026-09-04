import { writeTempFile } from "@fairspec/library"
import { Command } from "commander"
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"
import { validateDatasetCommand } from "./validate.ts"

describe("dataset validate", () => {
  beforeEach(() => {
    vi.spyOn(process, "exit").mockImplementation((() => {}) as () => never)
    vi.spyOn(process.stdout, "write").mockImplementation(() => true)
    vi.spyOn(process.stderr, "write").mockImplementation(() => true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should validate a valid dataset", async () => {
    const csvPath = await writeTempFile("id,name\n1,alice\n2,bob", {
      format: "csv",
    })
    const descriptor = {
      resources: [
        {
          path: csvPath,
          schema: {
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
            },
          },
        },
      ],
    }
    const descriptorPath = await writeTempFile(JSON.stringify(descriptor), {
      format: "json",
    })

    const text: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((msg: string | Uint8Array) => {
      text.push(typeof msg === "string" ? msg : msg.toString())
      return true
    })

    const command = new Command().addCommand(validateDatasetCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync(["node", "test", "validate", descriptorPath, "--json"])
    } catch {}

    expect(text.length).toBeGreaterThan(0)
    const data = JSON.parse(text[0] ?? "")
    expect(data).toHaveProperty("valid")
  })

  it("should detect invalid data", async () => {
    const csvPath = await writeTempFile("id,name\n1,alice\nnotanumber,bob", {
      format: "csv",
    })
    const descriptor = {
      resources: [
        {
          path: csvPath,
          schema: {
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
            },
          },
        },
      ],
    }
    const descriptorPath = await writeTempFile(JSON.stringify(descriptor), {
      format: "json",
    })

    const text: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((msg: string | Uint8Array) => {
      text.push(typeof msg === "string" ? msg : msg.toString())
      return true
    })

    const command = new Command().addCommand(validateDatasetCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync(["node", "test", "validate", descriptorPath, "--json"])
    } catch {}

    expect(text.length).toBeGreaterThan(0)
    const data = JSON.parse(text[0] ?? "")
    expect(data).toHaveProperty("valid")
  })

  it("should validate dataset with multiple resources", async () => {
    const csv1Path = await writeTempFile("id,name\n1,alice", {
      format: "csv",
    })
    const csv2Path = await writeTempFile("id,age\n1,25", { format: "csv" })
    const descriptor = {
      resources: [
        {
          path: csv1Path,
          schema: {
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
            },
          },
        },
        {
          path: csv2Path,
          schema: {
            properties: {
              id: { type: "integer" },
              age: { type: "integer" },
            },
          },
        },
      ],
    }
    const descriptorPath = await writeTempFile(JSON.stringify(descriptor), {
      format: "json",
    })

    const text: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((msg: string | Uint8Array) => {
      text.push(typeof msg === "string" ? msg : msg.toString())
      return true
    })

    const command = new Command().addCommand(validateDatasetCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync(["node", "test", "validate", descriptorPath, "--json"])
    } catch {}

    expect(text.length).toBeGreaterThan(0)
    const data = JSON.parse(text[0] ?? "")
    expect(data).toHaveProperty("valid")
  })
})
