import { afterEach, describe, expect, it, vi } from "vite-plus/test"
import datasetProfile from "../../../profiles/dataset.json" with { type: "json" }
import { FAIRSPEC_VERSION } from "../../../settings.ts"
import { loadProfile } from "../load.ts"

describe("loadProfile", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // Stubbing fetch is the assertion: a registry miss is only visible as a network call.
  function stubOfflineFetch() {
    const fetchMock = vi.fn(async (url: string) => {
      throw new TypeError(`offline: ${url}`)
    })

    vi.stubGlobal("fetch", fetchMock)
    return fetchMock
  }

  it("resolves a latest profile path from the registry", async () => {
    const fetchMock = stubOfflineFetch()

    const profile = await loadProfile(
      "https://fairspec.org/profiles/latest/dataset.json",
      { profileType: "dataset" },
    )

    expect(profile).toBe(datasetProfile)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("resolves the bundled version profile path from the registry", async () => {
    const fetchMock = stubOfflineFetch()

    const profile = await loadProfile(
      `https://fairspec.org/profiles/${FAIRSPEC_VERSION}/dataset.json`,
      { profileType: "dataset" },
    )

    expect(profile).toBe(datasetProfile)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("goes remote for a version the bundle does not carry", async () => {
    const fetchMock = stubOfflineFetch()

    await expect(
      loadProfile("https://fairspec.org/profiles/0.4.0/dataset.json", {
        profileType: "dataset",
      }),
    ).rejects.toThrow("offline")

    expect(fetchMock).toHaveBeenCalled()
  })
})
