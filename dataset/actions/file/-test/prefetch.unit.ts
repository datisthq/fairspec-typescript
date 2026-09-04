import * as fs from "node:fs/promises"
import type { Resource } from "@fairspec/metadata"
import { describe, expect, it } from "vite-plus/test"
import { useRecording } from "vitest-polly"
import { prefetchFiles } from "../prefetch.ts"

useRecording()

describe("prefetchFiles", () => {
  const remoteUrl =
    "https://raw.githubusercontent.com/datisthq/fairspec-typescript/refs/heads/main/table/plugins/csv/actions/table/-test/fixtures/table.csv"

  it("should prefetch files without maxBytes option", async () => {
    const resource: Resource = { data: remoteUrl }

    const result = await prefetchFiles(resource)

    expect(result).toHaveLength(1)
    const filePath = result[0]
    expect.assert(filePath)

    const stats = await fs.stat(filePath)
    expect(stats.size).toBe(27)

    const content = await fs.readFile(filePath, "utf-8")
    expect(content).toContain("id,name")
  })

  it("should prefetch files with maxBytes option", async () => {
    const resource: Resource = { data: remoteUrl }
    const maxBytes = 18

    const result = await prefetchFiles(resource, { maxBytes })

    expect(result).toHaveLength(1)
    const filePath = result[0]
    expect.assert(filePath)

    const stats = await fs.stat(filePath)
    expect(stats.size).toBe(maxBytes)

    const content = await fs.readFile(filePath, "utf-8")
    expect(content).toContain("id,name")
    expect(content).toContain("1,english")
    expect(content).not.toContain("中文")
  })
})
