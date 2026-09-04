import { relative } from "node:path"
import type { Dataset } from "@fairspec/metadata"
import { loadDatasetDescriptor } from "@fairspec/metadata"
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"
import { saveDatasetToZenodo } from "../save.ts"

describe("saveDatasetToZenodo", () => {
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
    sandbox: true,
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
    const dataset = await loadDatasetDescriptor("core/package/fixtures/package.json")

    const result = await saveDatasetToZenodo(dataset, {
      apiKey: "<key>",
      sandbox: true,
    })

    expect(result).toBeDefined()
  })

  it("creates a deposition in Zenodo with correct API calls", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 12345,
          links: {
            self: "https://sandbox.zenodo.org/api/deposit/depositions/12345",
            html: "https://sandbox.zenodo.org/deposit/12345",
            files: "https://sandbox.zenodo.org/api/deposit/depositions/12345/files",
            bucket: "https://sandbox.zenodo.org/api/files/bucket-id",
          },
          metadata: {
            title: "Test Package",
            description: "A test package",
            upload_type: "dataset",
            creators: [],
          },
          state: "unsubmitted",
          submitted: false,
          files: [],
        }),
    })

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "file-1",
          filename: "data.csv",
          filesize: 100,
        }),
    })

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "file-2",
          filename: "dataset.json",
          filesize: 500,
        }),
    })

    const result = await saveDatasetToZenodo(mockDataset, mockOptions)

    expect(fetchMock).toHaveBeenCalledTimes(3)

    const depositionCreateCall = fetchMock.mock.calls[0]
    expect(depositionCreateCall).toBeDefined()
    if (!depositionCreateCall) return

    expect(depositionCreateCall[0]).toContain(
      "https://sandbox.zenodo.org/api/deposit/depositions",
    )
    expect(depositionCreateCall[0]).toContain("access_token=test-api-key")
    expect(depositionCreateCall[1]).toMatchObject({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const depositionPayload = JSON.parse(depositionCreateCall[1].body)
    expect(depositionPayload.metadata.title).toEqual("Test Package")
    expect(depositionPayload.metadata.description).toEqual("A test package")

    expect(result).toEqual({
      path: "https://sandbox.zenodo.org/records/12345/files/dataset.json",
      datasetUrl: "https://sandbox.zenodo.org/uploads/12345",
    })
  })

  it("uploads resource files to deposition", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 12345,
          links: {
            self: "https://sandbox.zenodo.org/api/deposit/depositions/12345",
            html: "https://sandbox.zenodo.org/deposit/12345",
            files: "https://sandbox.zenodo.org/api/deposit/depositions/12345/files",
            bucket: "https://sandbox.zenodo.org/api/files/bucket-id",
          },
          metadata: {
            title: "Test Package",
            description: "A test package",
            upload_type: "dataset",
            creators: [],
          },
          state: "unsubmitted",
          submitted: false,
          files: [],
        }),
    })

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "file-1",
          filename: "data.csv",
          filesize: 100,
        }),
    })

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "file-2",
          filename: "dataset.json",
          filesize: 500,
        }),
    })

    await saveDatasetToZenodo(mockDataset, mockOptions)

    const fileUploadCall = fetchMock.mock.calls[1]
    expect(fileUploadCall).toBeDefined()
    if (!fileUploadCall) return

    expect(fileUploadCall[0]).toContain(
      "https://sandbox.zenodo.org/api/deposit/depositions/12345/files",
    )
    expect(fileUploadCall[0]).toContain("access_token=test-api-key")
    expect(fileUploadCall[1]).toMatchObject({
      method: "POST",
    })

    const formData = fileUploadCall[1].body
    expect(formData).toBeInstanceOf(FormData)
  })

  it("uploads dataset.json metadata file", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 12345,
          links: {
            self: "https://sandbox.zenodo.org/api/deposit/depositions/12345",
            html: "https://sandbox.zenodo.org/deposit/12345",
            files: "https://sandbox.zenodo.org/api/deposit/depositions/12345/files",
            bucket: "https://sandbox.zenodo.org/api/files/bucket-id",
          },
          metadata: {
            title: "Test Package",
            description: "A test package",
            upload_type: "dataset",
            creators: [],
          },
          state: "unsubmitted",
          submitted: false,
          files: [],
        }),
    })

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "file-1",
          filename: "data.csv",
          filesize: 100,
        }),
    })

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "file-2",
          filename: "dataset.json",
          filesize: 500,
        }),
    })

    await saveDatasetToZenodo(mockDataset, mockOptions)

    const datasetUploadCall = fetchMock.mock.calls[2]
    expect(datasetUploadCall).toBeDefined()
    if (!datasetUploadCall) return

    expect(datasetUploadCall[0]).toContain(
      "https://sandbox.zenodo.org/api/deposit/depositions/12345/files",
    )

    const formData = datasetUploadCall[1].body
    expect(formData).toBeInstanceOf(FormData)

    const fileBlob = formData.get("file")
    expect(fileBlob).toBeInstanceOf(Blob)
  })

  it("uses production API when sandbox is false", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 12345,
          links: {
            self: "https://zenodo.org/api/deposit/depositions/12345",
            html: "https://zenodo.org/deposit/12345",
            files: "https://zenodo.org/api/deposit/depositions/12345/files",
            bucket: "https://zenodo.org/api/files/bucket-id",
          },
          metadata: {
            title: "Test Package",
            description: "A test package",
            upload_type: "dataset",
            creators: [],
          },
          state: "unsubmitted",
          submitted: false,
          files: [],
        }),
    })

    fetchMock.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "file-1",
          filename: "data.csv",
        }),
    })

    await saveDatasetToZenodo(mockDataset, {
      apiKey: "test-api-key",
      sandbox: false,
    })

    const depositionCreateCall = fetchMock.mock.calls[0]
    expect(depositionCreateCall).toBeDefined()
    if (!depositionCreateCall) return

    expect(depositionCreateCall[0]).toContain("https://zenodo.org/api")
    expect(depositionCreateCall[0]).not.toContain("sandbox")
  })

  it("passes API key as access_token query parameter", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 12345,
          links: {
            self: "https://sandbox.zenodo.org/api/deposit/depositions/12345",
            html: "https://sandbox.zenodo.org/deposit/12345",
            files: "https://sandbox.zenodo.org/api/deposit/depositions/12345/files",
            bucket: "https://sandbox.zenodo.org/api/files/bucket-id",
          },
          metadata: {
            title: "Test Package",
            description: "A test package",
            upload_type: "dataset",
            creators: [],
          },
          state: "unsubmitted",
          submitted: false,
          files: [],
        }),
    })

    await saveDatasetToZenodo(mockDataset, {
      apiKey: "custom-api-key",
      sandbox: true,
    })

    const depositionCreateCall = fetchMock.mock.calls[0]
    expect(depositionCreateCall).toBeDefined()
    if (!depositionCreateCall) return

    expect(depositionCreateCall[0]).toContain("access_token=custom-api-key")
  })

  it("handles API errors from deposition creation", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      text: () => Promise.resolve("Invalid deposition data"),
    })

    await expect(saveDatasetToZenodo(mockDataset, mockOptions)).rejects.toThrow(
      "Zenodo API error: 400 Bad Request",
    )
  })

  it("handles API errors from file upload", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 12345,
          links: {
            self: "https://sandbox.zenodo.org/api/deposit/depositions/12345",
            html: "https://sandbox.zenodo.org/deposit/12345",
            files: "https://sandbox.zenodo.org/api/deposit/depositions/12345/files",
            bucket: "https://sandbox.zenodo.org/api/files/bucket-id",
          },
          metadata: {
            title: "Test Package",
            description: "A test package",
            upload_type: "dataset",
            creators: [],
          },
          state: "unsubmitted",
          submitted: false,
          files: [],
        }),
    })

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: () => Promise.resolve("Failed to upload file"),
    })

    await expect(saveDatasetToZenodo(mockDataset, mockOptions)).rejects.toThrow(
      "Zenodo API error: 500 Internal Server Error",
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
          id: 12345,
          links: {
            self: "https://sandbox.zenodo.org/api/deposit/depositions/12345",
            html: "https://sandbox.zenodo.org/deposit/12345",
            files: "https://sandbox.zenodo.org/api/deposit/depositions/12345/files",
            bucket: "https://sandbox.zenodo.org/api/files/bucket-id",
          },
          metadata: {
            title: "Test Package",
            description: "A test package",
            upload_type: "dataset",
            creators: [],
          },
          state: "unsubmitted",
          submitted: false,
          files: [],
        }),
    })

    await saveDatasetToZenodo(multiResourceDataset, mockOptions)

    expect(fetchMock).toHaveBeenCalledTimes(4)

    const secondFileUploadCall = fetchMock.mock.calls[2]
    expect(secondFileUploadCall).toBeDefined()
    if (!secondFileUploadCall) return

    expect(secondFileUploadCall[0]).toContain("/files")
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
          id: 12345,
          links: {
            self: "https://sandbox.zenodo.org/api/deposit/depositions/12345",
            html: "https://sandbox.zenodo.org/deposit/12345",
            files: "https://sandbox.zenodo.org/api/deposit/depositions/12345/files",
            bucket: "https://sandbox.zenodo.org/api/files/bucket-id",
          },
          metadata: {
            title: "Test Package",
            description: "A test package",
            upload_type: "dataset",
            creators: [],
          },
          state: "unsubmitted",
          submitted: false,
          files: [],
        }),
    })

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "file-1",
          filename: "dataset.json",
          filesize: 500,
        }),
    })

    const result = await saveDatasetToZenodo(emptyDataset, mockOptions)

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result.datasetUrl).toEqual("https://sandbox.zenodo.org/uploads/12345")
  })

  it("skips resources without files", async () => {
    const datasetWithoutData: Dataset = {
      ...mockDataset,
      resources: [
        {
          name: "resource-without-data",
          data: { key: "value" },
        },
      ],
    }

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 12345,
          links: {
            self: "https://sandbox.zenodo.org/api/deposit/depositions/12345",
            html: "https://sandbox.zenodo.org/deposit/12345",
            files: "https://sandbox.zenodo.org/api/deposit/depositions/12345/files",
            bucket: "https://sandbox.zenodo.org/api/files/bucket-id",
          },
          metadata: {
            title: "Test Package",
            description: "A test package",
            upload_type: "dataset",
            creators: [],
          },
          state: "unsubmitted",
          submitted: false,
          files: [],
        }),
    })

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "file-1",
          filename: "dataset.json",
          filesize: 500,
        }),
    })

    await saveDatasetToZenodo(datasetWithoutData, mockOptions)

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("includes creators in metadata", async () => {
    const datasetWithCreators: Dataset = {
      ...mockDataset,
      creators: [
        {
          name: "Alice Smith",
          nameType: "Personal",
          affiliation: [{ name: "University of Example" }],
        },
        {
          name: "Bob Jones",
          nameType: "Personal",
          affiliation: [{ name: "Institute of Testing" }],
        },
      ],
    }

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 12345,
          links: {
            self: "https://sandbox.zenodo.org/api/deposit/depositions/12345",
            html: "https://sandbox.zenodo.org/deposit/12345",
            files: "https://sandbox.zenodo.org/api/deposit/depositions/12345/files",
            bucket: "https://sandbox.zenodo.org/api/files/bucket-id",
          },
          metadata: {
            title: "Test Package",
            description: "A test package",
            upload_type: "dataset",
            creators: [
              {
                name: "Alice Smith",
                affiliation: "University of Example",
              },
              {
                name: "Bob Jones",
                affiliation: "Institute of Testing",
              },
            ],
          },
          state: "unsubmitted",
          submitted: false,
          files: [],
        }),
    })

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "file-1",
          filename: "data.csv",
          filesize: 100,
        }),
    })

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "file-2",
          filename: "dataset.json",
          filesize: 500,
        }),
    })

    await saveDatasetToZenodo(datasetWithCreators, mockOptions)

    const depositionCreateCall = fetchMock.mock.calls[0]
    expect(depositionCreateCall).toBeDefined()
    if (!depositionCreateCall) return

    const depositionPayload = JSON.parse(depositionCreateCall[1].body)
    expect(depositionPayload.metadata.creators).toEqual([
      {
        name: "Alice Smith",
        affiliation: "University of Example",
      },
      {
        name: "Bob Jones",
        affiliation: "Institute of Testing",
      },
    ])
  })
})
