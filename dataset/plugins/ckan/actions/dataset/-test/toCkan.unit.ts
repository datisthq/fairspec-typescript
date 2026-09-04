import type { Dataset } from "@fairspec/metadata"
import { describe, expect, it } from "vite-plus/test"
import type { CkanDataset } from "../../../models/dataset.ts"
import ckanPackageFixture from "./fixtures/ckan-dataset.json" with { type: "json" }
import { convertDatasetFromCkan } from "../fromCkan.ts"
import { convertDatasetToCkan } from "../toCkan.ts"

describe("convertDatasetToCkan", () => {
  it("converts a Fairspec Dataset to a CKAN dataset", () => {
    const dataset: Dataset = {
      titles: [{ title: "Test Package" }],
      descriptions: [
        {
          description: "This is a test package",
          descriptionType: "Abstract",
        },
      ],
      version: "1.0.0",
      rightsList: [
        {
          rights: "Creative Commons Attribution",
          rightsUri: "http://www.opendefinition.org/licenses/cc-by",
          rightsIdentifier: "cc-by",
        },
      ],
      creators: [
        {
          name: "Test Author",
          nameType: "Personal",
        },
      ],
      contributors: [
        {
          name: "Test Maintainer",
          nameType: "Personal",
          contributorType: "ContactPerson",
        },
      ],
      subjects: [{ subject: "test" }, { subject: "sample" }, { subject: "data" }],
      dates: [
        {
          date: "2023-01-01T00:00:00Z",
          dateType: "Created",
        },
        {
          date: "2023-01-02T00:00:00Z",
          dateType: "Updated",
        },
      ],
      resources: [
        {
          name: "test-resource",
          data: "https://example.com/data.csv",
          fileDialect: { format: "csv" },
          descriptions: [
            {
              description: "Test resource",
              descriptionType: "Abstract",
            },
          ],
          integrity: {
            type: "md5",
            hash: "1234567890abcdef",
          },
        },
      ],
    }

    const result = convertDatasetToCkan(dataset)

    expect(result.title).toEqual(dataset.titles?.[0]?.title)
    expect(result.notes).toEqual(dataset.descriptions?.[0]?.description)
    expect(result.version).toEqual(dataset.version)

    if (dataset.rightsList && dataset.rightsList.length > 0) {
      const rights = dataset.rightsList[0]
      if (rights) {
        expect(result.license_id).toEqual(rights.rightsIdentifier)
        expect(result.license_title).toEqual(rights.rights)
        expect(result.license_url).toEqual(rights.rightsUri)
      }
    }

    if (dataset.creators && dataset.creators.length > 0) {
      const creator = dataset.creators[0]
      if (creator) {
        expect(result.author).toEqual(creator.name)
      }
    }

    if (dataset.contributors && dataset.contributors.length > 0) {
      const maintainer = dataset.contributors.find(
        c => c.contributorType === "ContactPerson",
      )
      if (maintainer) {
        expect(result.maintainer).toEqual(maintainer.name)
      }
    }

    if (dataset.subjects && dataset.subjects.length > 0) {
      expect(result.tags).toHaveLength(dataset.subjects.length)
      dataset.subjects.forEach((subject, index) => {
        const tag = result.tags?.[index]
        if (tag && subject.subject) {
          expect(tag.name).toEqual(subject.subject)
          expect(tag.display_name).toEqual(subject.subject)
        }
      })
    }

    const createdDate = dataset.dates?.find(d => d.dateType === "Created")
    if (createdDate) {
      expect(result.metadata_created).toEqual(createdDate.date)
    }

    const updatedDate = dataset.dates?.find(d => d.dateType === "Updated")
    if (updatedDate) {
      expect(result.metadata_modified).toEqual(updatedDate.date)
    }

    expect.assert(dataset.resources)
    expect(result.resources).toHaveLength(dataset.resources.length)

    expect(dataset.resources.length).toBeGreaterThan(0)
    expect(result.resources?.length).toBeGreaterThan(0)

    if (dataset.resources.length > 0 && result.resources.length > 0) {
      const firstResource = dataset.resources[0]
      const firstCkanResource = result.resources[0]

      expect(firstCkanResource).toBeDefined()
      expect(firstResource).toBeDefined()

      if (firstResource && firstCkanResource) {
        expect(firstCkanResource.name).toEqual(firstResource.name)
        expect(firstCkanResource.description).toEqual(
          firstResource.descriptions?.[0]?.description,
        )
        expect(firstCkanResource.hash).toEqual(firstResource.integrity?.hash)
      }
    }
  })

  it("handles empty resources array", () => {
    const dataset: Dataset = {
      resources: [],
    }

    const result = convertDatasetToCkan(dataset)

    expect(result.resources).toEqual([])
  })

  it("handles undefined optional properties", () => {
    const dataset: Dataset = {
      resources: [],
    }

    const result = convertDatasetToCkan(dataset)

    expect(result.title).toBeUndefined()
    expect(result.notes).toBeUndefined()
    expect(result.version).toBeUndefined()
    expect(result.metadata_created).toBeUndefined()
    expect(result.metadata_modified).toBeUndefined()
    expect(result.license_id).toBeUndefined()
    expect(result.license_title).toBeUndefined()
    expect(result.license_url).toBeUndefined()
    expect(result.author).toBeUndefined()
    expect(result.maintainer).toBeUndefined()
    expect(result.tags).toEqual([])
    expect(result.resources).toEqual([])
  })

  it("performs a round-trip conversion (CKAN → Dataset → CKAN)", () => {
    const originalCkanDataset = ckanPackageFixture as CkanDataset

    const dataset = convertDatasetFromCkan(originalCkanDataset)

    const resultCkanDataset = convertDatasetToCkan(dataset)

    expect(resultCkanDataset.title).toEqual(originalCkanDataset.title)
    expect(resultCkanDataset.notes).toEqual(originalCkanDataset.notes)
    expect(resultCkanDataset.version).toEqual(originalCkanDataset.version)

    expect(resultCkanDataset.license_id).toEqual(originalCkanDataset.license_id)
    expect(resultCkanDataset.license_title).toEqual(originalCkanDataset.license_title)
    expect(resultCkanDataset.license_url).toEqual(originalCkanDataset.license_url)

    expect(resultCkanDataset.author).toEqual(originalCkanDataset.author)
    expect(resultCkanDataset.maintainer).toEqual(originalCkanDataset.maintainer)

    expect(resultCkanDataset.metadata_created).toEqual(
      originalCkanDataset.metadata_created,
    )
    expect(resultCkanDataset.metadata_modified).toEqual(
      originalCkanDataset.metadata_modified,
    )

    expect(resultCkanDataset.resources.length).toBeGreaterThan(0)

    expect(resultCkanDataset.tags.length).toEqual(originalCkanDataset.tags.length)
    originalCkanDataset.tags.forEach(originalTag => {
      const matchingTag = resultCkanDataset.tags.find(
        tag => tag.name === originalTag.name,
      )
      expect(matchingTag).toBeTruthy()
    })
  })
})
