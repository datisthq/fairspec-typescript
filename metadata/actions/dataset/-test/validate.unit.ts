import { describe, expect, it } from "vite-plus/test"
import { useRecording } from "vitest-polly"
import { validateDatasetDescriptor } from "../validate.ts"

useRecording()

describe("validateDatasetDescriptor", () => {
  it("returns valid result for valid dataset", async () => {
    const dataset = {
      resources: [
        {
          data: "data.csv",
        },
      ],
    }

    const report = await validateDatasetDescriptor(dataset)

    expect(report.valid).toBe(true)
    expect(report.errors).toEqual([])
  })

  it("returns validation errors for invalid dataset", async () => {
    const dataset = {
      resources: "not-an-array",
    }

    const report = await validateDatasetDescriptor(dataset)

    expect(report.valid).toBe(false)
    expect(report.errors.length).toBeGreaterThan(0)
  })

  it("dont return validation error for missing schema", async () => {
    const dataset = {
      resources: [
        {
          data: "data.csv",
        },
      ],
    }

    const report = await validateDatasetDescriptor(dataset)
    expect(report.valid).toBe(true)
  })

  it("validates dataset with resource integrity", async () => {
    const dataset = {
      resources: [
        {
          data: "data.csv",
          integrity: {
            type: "sha256",
            hash: "5f951fd841d3bd6c03ea05024f8c564096e10a3e17483e6a70d25a885942683a",
          },
        },
      ],
    }

    const report = await validateDatasetDescriptor(dataset)

    expect(report.valid).toBe(true)
    expect(report.errors).toEqual([])
  })

  it("validates dataset with datacite metadata", async () => {
    const dataset = {
      creators: [
        {
          name: "John Doe",
        },
      ],
      titles: [
        {
          title: "Example Dataset",
        },
      ],
      resources: [
        {
          data: "data.csv",
        },
      ],
    }

    const report = await validateDatasetDescriptor(dataset)

    expect(report.valid).toBe(true)
    expect(report.errors).toEqual([])
  })
})
