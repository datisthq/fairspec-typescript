import { describe, expect, it } from "vite-plus/test"
import { assertProfile } from "../assert.ts"

describe("assertProfile", () => {
  it("returns profile for valid json schema", async () => {
    const jsonSchema = {
      type: "object",
      properties: {
        name: { type: "string" },
      },
    }

    const profile = await assertProfile(jsonSchema, {
      path: "https://fairspec.org/profiles/1.0.0/catalog.json",
      type: "catalog",
    })

    expect(profile).toEqual(jsonSchema)
  })

  it("returns profile for dataset type", async () => {
    const jsonSchema = {
      type: "object",
      properties: {
        title: { type: "string" },
      },
    }

    const profile = await assertProfile(jsonSchema, {
      path: "https://fairspec.org/profiles/1.0.0/dataset.json",
      type: "dataset",
    })

    expect(profile).toEqual(jsonSchema)
  })

  it("returns profile for table type", async () => {
    const jsonSchema = {
      type: "object",
      properties: {
        fields: { type: "array" },
      },
    }

    const profile = await assertProfile(jsonSchema, {
      path: "https://fairspec.org/profiles/1.0.0/table-schema.json",
      type: "table-schema",
    })

    expect(profile).toEqual(jsonSchema)
  })

  it("accepts different semantic versions", async () => {
    const jsonSchema = {
      type: "object",
    }

    const profile1 = await assertProfile(jsonSchema, {
      path: "https://fairspec.org/profiles/1.0.0/catalog.json",
      type: "catalog",
    })
    expect(profile1).toEqual(jsonSchema)

    const profile2 = await assertProfile(jsonSchema, {
      path: "https://fairspec.org/profiles/10.20.30/dataset.json",
      type: "dataset",
    })
    expect(profile2).toEqual(jsonSchema)
  })

  it("throws error for path with mismatched type", async () => {
    const jsonSchema = {
      type: "object",
    }

    await expect(
      assertProfile(jsonSchema, {
        path: "https://fairspec.org/profiles/1.0.0/catalog.json",
        type: "dataset",
      }),
    ).rejects.toThrow(
      "Profile at path https://fairspec.org/profiles/1.0.0/catalog.json is not a valid dataset profile",
    )
  })

  it("throws error for invalid URL format", async () => {
    const jsonSchema = {
      type: "object",
    }

    await expect(
      assertProfile(jsonSchema, {
        path: "https://example.com/catalog.json",
        type: "catalog",
      }),
    ).rejects.toThrow(
      "Profile at path https://example.com/catalog.json is not a valid catalog profile",
    )
  })

  it("accepts 'latest' version", async () => {
    const jsonSchema = {
      type: "object",
    }

    await assertProfile(jsonSchema, {
      path: "https://fairspec.org/profiles/latest/catalog.json",
      type: "catalog",
    })
  })

  it("throws error for custom profile path without extending official profile", async () => {
    const jsonSchema = {
      type: "object",
      properties: {
        name: { type: "string" },
      },
    }

    await expect(
      assertProfile(jsonSchema, {
        path: "https://example.com/custom-catalog.json",
        type: "catalog",
      }),
    ).rejects.toThrow(
      "Profile at path https://example.com/custom-catalog.json is not a valid catalog profile",
    )
  })

  it("returns profile when custom profile extends official profile via allOf", async () => {
    const jsonSchema = {
      type: "object",
      allOf: ["https://fairspec.org/profiles/1.0.0/catalog.json"],
    }

    const profile = await assertProfile(jsonSchema, {
      path: "https://example.com/custom-catalog.json",
      type: "catalog",
    })

    expect(profile).toEqual(jsonSchema)
  })
})
