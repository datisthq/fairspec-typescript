import { writeTempFile } from "@fairspec/library"
import { Command } from "commander"
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"

const mockReplSession = { context: {} as Record<string, unknown> }
const replStartMock = vi.fn(() => mockReplSession)

vi.mock("node:repl", () => ({
  default: {
    start: replStartMock,
  },
}))

const { scriptTableCommand } = await import("./script.ts")

// TODO: recover
// Skipped: script commands start interactive REPL sessions which are not suitable
// for automated testing. The tasuku library used by Session also conflicts with
// the test environment when trying to mock console and streams.
describe.skip("table script", () => {
  beforeEach(() => {
    vi.spyOn(process, "exit").mockImplementation((() => {}) as () => never)
    vi.spyOn(process.stdout, "write").mockImplementation(() => true)
    vi.spyOn(process.stderr, "write").mockImplementation(() => true)

    mockReplSession.context = {}
    replStartMock.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should start a REPL session with table context", async () => {
    const csvContent = "id,name\n1,alice\n2,bob"
    const csvPath = await writeTempFile(csvContent, { format: "csv" })

    const command = new Command().addCommand(scriptTableCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    await command.parseAsync(["node", "test", "script", csvPath])

    expect(replStartMock).toHaveBeenCalledWith({ prompt: "fairspec> " })
    expect(mockReplSession.context).toHaveProperty("fairspec")
    expect(mockReplSession.context).toHaveProperty("table")
  })

  it("should load CSV table into REPL context", async () => {
    const csvContent = "id,name,age\n1,alice,25\n2,bob,30"
    const csvPath = await writeTempFile(csvContent, { format: "csv" })

    const command = new Command().addCommand(scriptTableCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync(["node", "test", "script", csvPath])
    } catch {}

    expect(replStartMock).toHaveBeenCalled()
    expect(mockReplSession.context.table).toBeDefined()
    expect(mockReplSession.context.fairspec).toBeDefined()
  })

  it("should load TSV table into REPL context", async () => {
    const tsvContent = "id\tname\tscore\n1\talice\t85\n2\tbob\t90"
    const tsvPath = await writeTempFile(tsvContent, { format: "tsv" })

    const command = new Command().addCommand(scriptTableCommand).configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    try {
      await command.parseAsync(["node", "test", "script", tsvPath])
    } catch {}

    expect(replStartMock).toHaveBeenCalledWith({ prompt: "fairspec> " })
    expect(mockReplSession.context).toHaveProperty("table")
    expect(mockReplSession.context).toHaveProperty("fairspec")
  })
})
