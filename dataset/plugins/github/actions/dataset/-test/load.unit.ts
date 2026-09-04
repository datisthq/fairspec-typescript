import { describe, expect, it } from "vite-plus/test"
import { useRecording } from "vitest-polly"
import { loadDatasetFromGithub } from "../load.ts"

useRecording()

describe("loadDatasetFromGithub", () => {
  it("should load a dataset", async () => {
    const dataset = await loadDatasetFromGithub("https://github.com/roll/data")
    expect(dataset).toMatchSnapshot()
  })
})
