import { writeTempFile } from "@fairspec/library"
import { Command } from "commander"
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"

let mockReplSession: { context: Record<string, unknown> }
const replStartMock = vi.fn(() => mockReplSession)

vi.mock("node:repl", () => ({
  default: {
    start: replStartMock,
  },
}))

const { scriptDatasetCommand } = await import("./script.ts")

// TODO: recover
// Skipped: script commands start interactive REPL sessions which are not suitable
// for automated testing. The tasuku library used by Session also conflicts with
// the test environment when trying to mock console and streams.
describe.skip("dataset script", () => {
  beforeEach(() => {
    vi.spyOn(process, "exit").mockImplementation((() => {}) as () => never)
    vi.spyOn(process.stdout, "write").mockImplementation(() => true)
    vi.spyOn(process.stderr, "write").mockImplementation(() => true)

    mockReplSession = { context: {} }
    replStartMock.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should start a REPL session with dataset context", async () => {
    const csvPath = await writeTempFile("id,name\n1,alice\n2,bob", {
      format: "csv",
    })
    const descriptor = {
      resources: [{ path: csvPath }],
    }
    const descriptorPath = await writeTempFile(JSON.stringify(descriptor), {
      format: "json",
    })

    const command = new Command().addCommand(scriptDatasetCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync(["node", "test", "script", descriptorPath])
    } catch {}

    expect(replStartMock).toHaveBeenCalledWith({ prompt: "fairspec> " })
    expect(mockReplSession.context).toHaveProperty("fairspec")
    expect(mockReplSession.context).toHaveProperty("dataset")
  })

  it("should load dataset with single resource into REPL context", async () => {
    const csvPath = await writeTempFile("id,value\n1,100\n2,200", {
      format: "csv",
    })
    const descriptor = {
      resources: [{ name: "data", path: csvPath }],
    }
    const descriptorPath = await writeTempFile(JSON.stringify(descriptor), {
      format: "json",
    })

    const command = new Command().addCommand(scriptDatasetCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync(["node", "test", "script", descriptorPath])
    } catch {}

    expect(replStartMock).toHaveBeenCalled()
    expect(mockReplSession.context.dataset).toBeDefined()
    expect(mockReplSession.context.fairspec).toBeDefined()
  })

  it("should load dataset with multiple resources into REPL context", async () => {
    const csv1Path = await writeTempFile("id,name\n1,alice", {
      format: "csv",
    })
    const csv2Path = await writeTempFile("id,age\n1,25", { format: "csv" })
    const descriptor = {
      resources: [
        { name: "users", path: csv1Path },
        { name: "ages", path: csv2Path },
      ],
    }
    const descriptorPath = await writeTempFile(JSON.stringify(descriptor), {
      format: "json",
    })

    const command = new Command().addCommand(scriptDatasetCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync(["node", "test", "script", descriptorPath])
    } catch {}

    expect(replStartMock).toHaveBeenCalledWith({ prompt: "fairspec> " })
    expect(mockReplSession.context).toHaveProperty("dataset")
    expect(mockReplSession.context).toHaveProperty("fairspec")
  })
})
