import { describe, expect, it } from "vite-plus/test"
import type { CkanDataset } from "../../../models/dataset.ts"
import ckanPackageFixture from "./fixtures/ckan-dataset.json" with { type: "json" }
import { convertDatasetFromCkan } from "../fromCkan.ts"

describe("convertDatasetFromCkan", () => {
  it("converts a CKAN dataset to a Fairspec Dataset", () => {
    const ckanDataset = ckanPackageFixture as CkanDataset

    const result = convertDatasetFromCkan(ckanDataset)

    expect(result.titles).toHaveLength(1)
    expect(result.titles?.[0]?.title).toEqual(ckanDataset.title)

    expect(result.descriptions).toHaveLength(1)
    expect(result.descriptions?.[0]?.description).toEqual(ckanDataset.notes)
    expect(result.descriptions?.[0]?.descriptionType).toEqual("Abstract")

    expect(result.version).toEqual(ckanDataset.version)

    expect(result.dates).toHaveLength(2)
    const createdDate = result.dates?.find(d => d.dateType === "Created")
    expect(createdDate?.date).toEqual(ckanDataset.metadata_created)
    const updatedDate = result.dates?.find(d => d.dateType === "Updated")
    expect(updatedDate?.date).toEqual(ckanDataset.metadata_modified)

    expect(result.rightsList).toHaveLength(1)
    if (result.rightsList && result.rightsList.length > 0) {
      const rights = result.rightsList[0]
      if (rights) {
        expect(rights.rights).toEqual(ckanDataset.license_title)
        expect(rights.rightsUri).toEqual(ckanDataset.license_url)
        expect(rights.rightsIdentifier).toEqual(ckanDataset.license_id)
      }
    }

    expect(result.creators).toHaveLength(1)
    if (result.creators?.[0]) {
      expect(result.creators[0].name).toEqual(ckanDataset.author)
      expect(result.creators[0].nameType).toEqual("Personal")
    }

    expect(result.contributors).toHaveLength(1)
    if (result.contributors?.[0]) {
      expect(result.contributors[0].name).toEqual(ckanDataset.maintainer)
      expect(result.contributors[0].nameType).toEqual("Personal")
      expect(result.contributors[0].contributorType).toEqual("ContactPerson")
    }

    expect(result.subjects).toHaveLength(ckanDataset.tags.length)
    expect(result.subjects?.map(s => s.subject)).toEqual(
      ckanDataset.tags.map(tag => tag.name),
    )

    expect(result.resources).toHaveLength(ckanDataset.resources.length)

    const firstCkanResource = ckanDataset.resources[0]
    const firstResource = result.resources?.[0]

    expect(firstCkanResource).toBeDefined()
    expect(firstResource).toBeDefined()

    if (firstResource && firstCkanResource) {
      expect(firstResource.data).toEqual(firstCkanResource.url)
      expect(firstResource.name).toMatch(/^sample[-_]linked[-_]csv$/)
      expect(firstResource.descriptions?.[0]?.description).toEqual(
        firstCkanResource.description,
      )
    }
  })

  it("handles empty resources array", () => {
    const ckanDataset: CkanDataset = {
      ...(ckanPackageFixture as CkanDataset),
      resources: [],
    }

    const result = convertDatasetFromCkan(ckanDataset)

    expect(result.resources).toEqual([])
  })

  it("handles undefined optional properties", () => {
    const ckanDataset: Partial<CkanDataset> = {
      resources: [],
      tags: [],
      id: "test",
      name: "test",
    }

    const result = convertDatasetFromCkan(ckanDataset as CkanDataset)

    expect(result.titles).toBeUndefined()
    expect(result.descriptions).toBeUndefined()
    expect(result.version).toBeUndefined()
    expect(result.dates).toBeUndefined()
    expect(result.rightsList).toBeUndefined()
    expect(result.creators).toBeUndefined()
    expect(result.contributors).toBeUndefined()
    expect(result.subjects).toBeUndefined()
    expect(result.resources).toEqual([])
  })
})
