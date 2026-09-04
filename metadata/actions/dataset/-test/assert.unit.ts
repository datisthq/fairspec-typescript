import { describe, expect, expectTypeOf, it } from "vite-plus/test"
import type { Dataset } from "../../../models/dataset.ts"
import { assertDataset } from "../assert.ts"

describe("assertDataset", () => {
  it("returns typed package when valid", async () => {
    const descriptor = {
      language: "en",
      resources: [
        {
          name: "name",
          data: "table.csv",
        },
      ],
    }

    const dataset = await assertDataset(descriptor)

    expectTypeOf(dataset).toEqualTypeOf<Dataset>()
    expect(dataset).toEqual(descriptor)
  })

  it("throws Error when package is invalid", async () => {
    const descriptor = {
      language: 123,
      resources: "not-an-array",
    }

    await expect(assertDataset(descriptor)).rejects.toThrow(Error)
  })
})
