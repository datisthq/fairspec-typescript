import { describe, expect, it } from "vite-plus/test"
import { useRecording } from "vitest-polly"
import { loadDatasetFromZenodo } from "../load.ts"

useRecording()

describe("loadDatasetFromZenodo", () => {
  it("should load a package", async () => {
    const dataset = await loadDatasetFromZenodo("https://zenodo.org/records/15525711")

    expect(dataset).toMatchSnapshot()
  })
})
