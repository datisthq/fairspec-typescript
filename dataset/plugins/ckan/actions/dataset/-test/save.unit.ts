import { relative } from "node:path"
import type { Dataset } from "@fairspec/metadata"
import { loadDatasetDescriptor } from "@fairspec/metadata"
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"
import { saveDatasetToCkan } from "../save.ts"

describe("saveDatasetToCkan", () => {
  const getFixturePath = (name: string) =>
    relative(process.cwd(), `${import.meta.dirname}/fixtures/${name}`)

  const mockDataset: Dataset = {
    titles: [{ title: "Test Package" }],
    descriptions: [
      {
        description: "A test package",
        descriptionType: "Abstract",
      },
    ],
    version: "1.0.0",
    resources: [
      {
        name: "test-resource",
        data: getFixturePath("data.csv"),
        fileDialect: { format: "csv" },
      },
    ],
  }

  const mockOptions = {
    apiKey: "test-api-key",
    ckanUrl: "https://ckan.example.com",
    ownerOrg: "test-org",
    datasetName: "test-dataset",
  }

  const originalFetch = globalThis.fetch
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    // @ts-expect-error
    globalThis.fetch = fetchMock
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.resetAllMocks()
  })

  it.skip("should save a dataset", async () => {
    const dataset = await loadDatasetDescriptor("core/dataset/fixtures/dataset.json")

    const result = await saveDatasetToCkan(dataset, {
      ckanUrl: "http://localhost:5000/",
      apiKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJ1T0Y0VUNybTU5Y0dzdlk3ejhreF9CeC02R0w4RDBOdW9QS0J0WkJFXzlJIiwiaWF0IjoxNzQ3OTI0NDg5fQ.ioGiLlZkm24xHQRBas5X5ig5eU7u_fIjkl4oifGnLaA",
      datasetName: "test",
      ownerOrg: "test",
    })

    expect(result).toBeDefined()
  })

  it("creates a dataset in CKAN with correct API calls", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          result: {
            name: "test-dataset",
            url: "https://ckan.example.com/dataset/test-dataset",
          },
        }),
    })

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          result: {
            id: "resource-1",
            url: "https://ckan.example.com/dataset/test-dataset/resource/resource-1",
          },
        }),
    })

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          result: {
            id: "resource-2",
            url: "https://ckan.example.com/dataset/test-dataset/resource/resource-2",
          },
        }),
    })

    const result = await saveDatasetToCkan(mockDataset, mockOptions)

    expect(fetchMock).toHaveBeenCalledTimes(3)

    const datasetCreateCall = fetchMock.mock.calls[0]
    expect(datasetCreateCall).toBeDefined()
    if (!datasetCreateCall) return

    expect(datasetCreateCall[0]).toEqual(
      "https://ckan.example.com/api/3/action/package_create",
    )
    expect(datasetCreateCall[1]).toMatchObject({
      method: "POST",
      headers: {
        Authorization: "test-api-key",
        "Content-Type": "application/json",
      },
    })

    const datasetPayload = JSON.parse(datasetCreateCall[1].body)
    expect(datasetPayload.name).toEqual("test-dataset")
    expect(datasetPayload.owner_org).toEqual("test-org")
    expect(datasetPayload.title).toEqual("Test Package")
    expect(datasetPayload.notes).toEqual("A test package")
    expect(datasetPayload.resources).toEqual([])

    expect(result).toEqual({
      path: "https://ckan.example.com/dataset/test-dataset",
      datasetUrl: "https://ckan.example.com/dataset/test-dataset",
    })
  })

  it("creates resources with file uploads", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          result: {
            name: "test-dataset",
            url: "https://ckan.example.com/dataset/test-dataset",
          },
        }),
    })

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          result: {
            id: "resource-1",
            url: "https://ckan.example.com/dataset/test-dataset/resource/resource-1",
          },
        }),
    })

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          result: {
            id: "resource-2",
            url: "https://ckan.example.com/dataset/test-dataset/resource/resource-2",
          },
        }),
    })

    await saveDatasetToCkan(mockDataset, mockOptions)

    const resourceCreateCall = fetchMock.mock.calls[1]
    expect(resourceCreateCall).toBeDefined()
    if (!resourceCreateCall) return

    expect(resourceCreateCall[0]).toEqual(
      "https://ckan.example.com/api/3/action/resource_create",
    )
    expect(resourceCreateCall[1]).toMatchObject({
      method: "POST",
      headers: {
        Authorization: "test-api-key",
      },
    })

    const formData = resourceCreateCall[1].body
    expect(formData).toBeInstanceOf(FormData)
    expect(formData.get("package_id")).toEqual("test-dataset")
    expect(formData.get("name")).toEqual("data.csv")
  })

  it("creates datapackage.json resource", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          result: {
            name: "test-dataset",
            url: "https://ckan.example.com/dataset/test-dataset",
          },
        }),
    })

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          result: {
            id: "resource-1",
            url: "https://ckan.example.com/dataset/test-dataset/resource/resource-1",
          },
        }),
    })

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          result: {
            id: "resource-2",
            url: "https://ckan.example.com/dataset/test-dataset/resource/resource-2",
          },
        }),
    })

    await saveDatasetToCkan(mockDataset, mockOptions)

    const datapackageCreateCall = fetchMock.mock.calls[2]
    expect(datapackageCreateCall).toBeDefined()
    if (!datapackageCreateCall) return

    expect(datapackageCreateCall[0]).toEqual(
      "https://ckan.example.com/api/3/action/resource_create",
    )

    const formData = datapackageCreateCall[1].body
    expect(formData).toBeInstanceOf(FormData)
    expect(formData.get("package_id")).toEqual("test-dataset")
    expect(formData.get("name")).toEqual("datapackage.json")

    const uploadBlob = formData.get("upload")
    expect(uploadBlob).toBeInstanceOf(Blob)
  })

  it("handles API errors from package_create", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      text: () => Promise.resolve("Invalid package data"),
    })

    await expect(saveDatasetToCkan(mockDataset, mockOptions)).rejects.toThrow(
      "CKAN API error: 400 Bad Request",
    )
  })

  it("handles API errors from resource_create", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          result: {
            name: "test-dataset",
            url: "https://ckan.example.com/dataset/test-dataset",
          },
        }),
    })

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: () => Promise.resolve("Failed to create resource"),
    })

    await expect(saveDatasetToCkan(mockDataset, mockOptions)).rejects.toThrow(
      "CKAN API error: 500 Internal Server Error",
    )
  })

  it("handles CKAN API success: false responses", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: false,
          error: {
            message: "Package already exists",
          },
        }),
    })

    await expect(saveDatasetToCkan(mockDataset, mockOptions)).rejects.toThrow(
      "CKAN API error",
    )
  })

  it("handles datasets with multiple resources", async () => {
    const multiResourceDataset: Dataset = {
      ...mockDataset,
      resources: [
        {
          name: "resource-1",
          data: getFixturePath("data.csv"),
          fileDialect: { format: "csv" },
        },
        {
          name: "resource-2",
          data: getFixturePath("data.csv"),
          fileDialect: { format: "json" },
        },
      ],
    }

    fetchMock.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          result: {
            name: "test-dataset",
            url: "https://ckan.example.com/dataset/test-dataset",
          },
        }),
    })

    await saveDatasetToCkan(multiResourceDataset, mockOptions)

    expect(fetchMock).toHaveBeenCalledTimes(4)

    const secondResourceCall = fetchMock.mock.calls[2]
    expect(secondResourceCall).toBeDefined()
    if (!secondResourceCall) return

    expect(secondResourceCall[0]).toEqual(
      "https://ckan.example.com/api/3/action/resource_create",
    )
  })

  it("handles datasets with no resources", async () => {
    const emptyDataset: Dataset = {
      ...mockDataset,
      resources: [],
    }

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          result: {
            name: "test-dataset",
            url: "https://ckan.example.com/dataset/test-dataset",
          },
        }),
    })

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          result: {
            id: "resource-1",
            url: "https://ckan.example.com/dataset/test-dataset/resource/resource-1",
          },
        }),
    })

    const result = await saveDatasetToCkan(emptyDataset, mockOptions)

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result.datasetUrl).toEqual("https://ckan.example.com/dataset/test-dataset")
  })

  it("passes API key in Authorization header", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          result: { name: "test-dataset" },
        }),
    })

    await saveDatasetToCkan(mockDataset, {
      ...mockOptions,
      apiKey: "custom-api-key",
    })

    const firstCall = fetchMock.mock.calls[0]
    expect(firstCall).toBeDefined()
    if (!firstCall) return

    const headers = firstCall[1].headers
    expect(headers.Authorization).toEqual("custom-api-key")
  })
})
