import { existsSync } from "node:fs"
import { mkdtemp, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { writeTempFile } from "@fairspec/library"
import { Command } from "commander"
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"
import { copyDatasetCommand } from "./copy.ts"

describe("dataset copy", () => {
  beforeEach(() => {
    vi.spyOn(process, "exit").mockImplementation((() => {}) as () => never)
    vi.spyOn(process.stdout, "write").mockImplementation(() => true)
    vi.spyOn(process.stderr, "write").mockImplementation(() => true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  async function makeSource(files: Record<string, string>, descriptor: unknown) {
    const source = await mkdtemp(join(tmpdir(), "dataset-copy-src-"))
    for (const [name, content] of Object.entries(files)) {
      await writeFile(join(source, name), content)
    }
    await writeFile(join(source, "datapackage.json"), JSON.stringify(descriptor))
    return join(source, "datapackage.json")
  }

  async function runCopyFrom(descriptorPath: string, targetPath: string) {
    const text: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((msg: string | Uint8Array) => {
      text.push(typeof msg === "string" ? msg : msg.toString())
      return true
    })

    const command = new Command().addCommand(copyDatasetCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    await command.parseAsync([
      "node",
      "test",
      "copy",
      descriptorPath,
      "--to-path",
      targetPath,
      "--json",
    ])

    return text
  }

  async function runCopy(descriptor: unknown, targetPath: string) {
    const descriptorPath = await writeTempFile(JSON.stringify(descriptor), {
      format: "json",
    })

    const text: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((msg: string | Uint8Array) => {
      text.push(typeof msg === "string" ? msg : msg.toString())
      return true
    })

    const command = new Command().addCommand(copyDatasetCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    await command.parseAsync([
      "node",
      "test",
      "copy",
      descriptorPath,
      "--to-path",
      targetPath,
      "--json",
    ])

    return text
  }

  function vacantTarget() {
    return join(tmpdir(), `dataset-copy-${Math.random().toString(36).slice(2)}`)
  }

  it("should copy a dataset to a new folder", async () => {
    const targetPath = vacantTarget()
    const descriptorPath = await makeSource(
      { "users.csv": "id,name\n1,alice\n2,bob" },
      { resources: [{ name: "users", data: "users.csv" }] },
    )

    const text = await runCopyFrom(descriptorPath, targetPath)

    expect(text.length).toBeGreaterThan(0)
    expect(JSON.parse(text[0] ?? "{}")).not.toHaveProperty("error")
    expect(existsSync(`${targetPath}/dataset.json`)).toBe(true)
    expect(existsSync(`${targetPath}/users.csv`)).toBe(true)
  })

  it("should copy a dataset with multiple resources", async () => {
    const targetPath = vacantTarget()
    const descriptorPath = await makeSource(
      { "a.csv": "id,name\n1,alice", "b.csv": "id,age\n1,25" },
      {
        resources: [
          { name: "a", data: "a.csv" },
          { name: "b", data: "b.csv" },
        ],
      },
    )

    await runCopyFrom(descriptorPath, targetPath)

    expect(existsSync(`${targetPath}/dataset.json`)).toBe(true)
    expect(existsSync(`${targetPath}/a.csv`)).toBe(true)
    expect(existsSync(`${targetPath}/b.csv`)).toBe(true)
  })

  it("should copy a dataset from inline data", async () => {
    const targetPath = vacantTarget()
    const descriptor = {
      resources: [
        {
          name: "data",
          data: [
            { id: 1, name: "alice" },
            { id: 2, name: "bob" },
          ],
        },
      ],
    }

    await runCopy(descriptor, targetPath)

    expect(existsSync(`${targetPath}/dataset.json`)).toBe(true)
  })
})
