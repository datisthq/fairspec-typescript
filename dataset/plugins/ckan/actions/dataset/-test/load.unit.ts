import { describe, expect, it } from "vite-plus/test"
import { useRecording } from "vitest-polly"
import { loadDatasetFromCkan } from "../load.ts"

useRecording()

describe("loadDatasetFromCkan", () => {
  it("should load a package", async () => {
    const dataset = await loadDatasetFromCkan(
      "https://data.nhm.ac.uk/dataset/join-the-dots-collection-level-descriptions",
    )

    expect(dataset).toMatchSnapshot()
  })
})
