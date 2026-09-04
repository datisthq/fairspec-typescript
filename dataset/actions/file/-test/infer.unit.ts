import { beforeEach, describe, expect, it, vi } from "vite-plus/test"
import { writeTempFile } from "../../../actions/file/temp.ts"
import { inferBytes, inferHash, inferTextual } from "../infer.ts"
import * as fetchModule from "../prefetch.ts"

vi.mock("../prefetch.ts", () => ({
  prefetchFiles: vi.fn(),
}))

describe("inferHash", () => {
  let mockPrefetchFiles: ReturnType<typeof vi.fn>
  let tempFilePath: string

  beforeEach(async () => {
    mockPrefetchFiles = vi.mocked(fetchModule.prefetchFiles)
    tempFilePath = await writeTempFile("Hello, World!")
    vi.clearAllMocks()
  })

  it("should compute sha256 hash by default", async () => {
    mockPrefetchFiles.mockResolvedValue([tempFilePath])

    const result = await inferHash({ data: "https://example.com/file.txt" })

    expect(mockPrefetchFiles).toHaveBeenCalledWith({
      data: "https://example.com/file.txt",
    })
    expect(result).toMatch(/^[a-f0-9]{64}$/)
  })

  it("should compute md5 hash when specified", async () => {
    mockPrefetchFiles.mockResolvedValue([tempFilePath])

    const result = await inferHash(
      { data: "https://example.com/file.txt" },
      {
        hashType: "md5",
      },
    )

    expect(mockPrefetchFiles).toHaveBeenCalledWith({
      data: "https://example.com/file.txt",
    })
    expect(result).toMatch(/^[a-f0-9]{32}$/)
  })

  it("should compute sha1 hash when specified", async () => {
    mockPrefetchFiles.mockResolvedValue([tempFilePath])

    const result = await inferHash(
      { data: "https://example.com/file.txt" },
      {
        hashType: "sha1",
      },
    )

    expect(mockPrefetchFiles).toHaveBeenCalledWith({
      data: "https://example.com/file.txt",
    })
    expect(result).toMatch(/^[a-f0-9]{40}$/)
  })

  it("should compute sha512 hash when specified", async () => {
    mockPrefetchFiles.mockResolvedValue([tempFilePath])

    const result = await inferHash(
      { data: "https://example.com/file.txt" },
      {
        hashType: "sha512",
      },
    )

    expect(mockPrefetchFiles).toHaveBeenCalledWith({
      data: "https://example.com/file.txt",
    })
    expect(result).toMatch(/^[a-f0-9]{128}$/)
  })

  it("should compute consistent hashes for same content", async () => {
    mockPrefetchFiles.mockResolvedValue([tempFilePath])

    const result1 = await inferHash({ data: "https://example.com/file.txt" })
    const result2 = await inferHash({ data: "https://example.com/file.txt" })

    expect(result1).toBe(result2)
  })
})

describe("inferBytes", () => {
  let mockPrefetchFiles: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockPrefetchFiles = vi.mocked(fetchModule.prefetchFiles)
    vi.clearAllMocks()
  })

  it("should return file size in bytes", async () => {
    const tempFilePath = await writeTempFile("Hello, World!")
    mockPrefetchFiles.mockResolvedValue([tempFilePath])

    const result = await inferBytes({ data: "https://example.com/file.txt" })

    expect(mockPrefetchFiles).toHaveBeenCalledWith({
      data: "https://example.com/file.txt",
    })
    expect(result).toBe(13)
  })

  it("should handle empty files", async () => {
    const tempFilePath = await writeTempFile("")
    mockPrefetchFiles.mockResolvedValue([tempFilePath])

    const result = await inferBytes({ data: "https://example.com/empty.txt" })

    expect(result).toBe(0)
  })

  it("should handle larger files", async () => {
    const tempFilePath = await writeTempFile("x".repeat(10000))
    mockPrefetchFiles.mockResolvedValue([tempFilePath])

    const result = await inferBytes({ data: "https://example.com/large.txt" })

    expect(result).toBe(10000)
  })

  it("should handle binary data", async () => {
    const tempFilePath = await writeTempFile(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))
    mockPrefetchFiles.mockResolvedValue([tempFilePath])

    const result = await inferBytes({ data: "https://example.com/file.bin" })

    expect(mockPrefetchFiles).toHaveBeenCalledWith({
      data: "https://example.com/file.bin",
    })
    expect(result).toBe(4)
  })
})

describe("inferTextual", () => {
  it("should return true for utf-8 text", async () => {
    const tempFilePath = await writeTempFile("Hello, World! This is UTF-8 text.")

    const result = await inferTextual({ data: tempFilePath })
    expect(result).toBe(true)
  })

  it("should return false for binary files", async () => {
    const tempFilePath = await writeTempFile(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]))

    const result = await inferTextual({ data: tempFilePath })
    expect(result).toBe(false)
  })

  it("should use custom sample bytes", async () => {
    const tempFilePath = await writeTempFile("This is a test file with UTF-8 content.")

    const result = await inferTextual({ data: tempFilePath }, { sampleBytes: 20 })

    expect(result).toBe(true)
  })

  it("should use custom confidence threshold", async () => {
    const tempFilePath = await writeTempFile("Sample text content")

    const result = await inferTextual(
      { data: tempFilePath },
      {
        confidencePercent: 50,
      },
    )

    expect(result).toBe(true)
  })

  it("should handle large text files", async () => {
    const tempFilePath = await writeTempFile("Hello World! ".repeat(1000))

    const result = await inferTextual({ data: tempFilePath })
    expect(result).toBe(true)
  })

  it("should handle empty files", async () => {
    const tempFilePath = await writeTempFile("")

    const result = await inferTextual({ data: tempFilePath })
    expect(result).toBe(true)
  })

  it("should handle files with special characters", async () => {
    const tempFilePath = await writeTempFile("Special: é, ñ, ü, ö, à")

    const result = await inferTextual({ data: tempFilePath })
    expect(result).toBe(true)
  })

  it("should return true with low confidence threshold", async () => {
    const tempFilePath = await writeTempFile("Simple text")

    const result = await inferTextual(
      { data: tempFilePath },
      {
        confidencePercent: 30,
      },
    )

    expect(result).toBe(true)
  })

  it("should return true for ascii text", async () => {
    const buffer = Buffer.from("Simple ASCII text only", "ascii")
    const tempFilePath = await writeTempFile(buffer)

    const result = await inferTextual({ data: tempFilePath })
    expect(result).toBe(true)
  })

  it("should return true for utf-8 with non-ascii unicode characters", async () => {
    const buffer = Buffer.from("Héllo, Wörld! 你好 مرحبا 🌍", "utf-8")
    const tempFilePath = await writeTempFile(buffer)

    const result = await inferTextual({ data: tempFilePath })
    expect(result).toBe(true)
  })

  it("should return true for files with cyrillic characters", async () => {
    const buffer = Buffer.from("Привет мир", "utf-8")
    const tempFilePath = await writeTempFile(buffer)

    const result = await inferTextual({ data: tempFilePath })
    expect(result).toBe(true)
  })

  it("should return true for files with japanese characters", async () => {
    const buffer = Buffer.from("こんにちは世界", "utf-8")
    const tempFilePath = await writeTempFile(buffer)

    const result = await inferTextual({ data: tempFilePath })
    expect(result).toBe(true)
  })

  it("should return true for files with arabic characters", async () => {
    const buffer = Buffer.from("مرحبا بالعالم", "utf-8")
    const tempFilePath = await writeTempFile(buffer)

    const result = await inferTextual({ data: tempFilePath })
    expect(result).toBe(true)
  })

  it("should return false for latin1 encoded file", async () => {
    const buffer = Buffer.from([
      0x43, 0x61, 0x66, 0xe9, 0x20, 0x72, 0xe9, 0x73, 0x75, 0x6d, 0xe9, 0x20, 0x6e, 0x61,
      0xef, 0x76, 0x65, 0x20, 0xe0, 0x20, 0x50, 0x61, 0x72, 0x69, 0x73, 0x2e, 0x20, 0xc7,
      0x61, 0x20, 0x63, 0x27, 0x65, 0x73, 0x74, 0x20, 0x62, 0x6f, 0x6e, 0x21,
    ])
    const tempFilePath = await writeTempFile(buffer)

    const result = await inferTextual({ data: tempFilePath })
    expect(result).toBe(false)
  })

  it("should return false for windows-1252 encoded file", async () => {
    const buffer = Buffer.from([
      0x43, 0x61, 0x66, 0xe9, 0x20, 0x6e, 0x61, 0xef, 0x76, 0x65, 0x20, 0x72, 0xe9, 0x73,
      0x75, 0x6d, 0xe9,
    ])
    const tempFilePath = await writeTempFile(buffer)

    const result = await inferTextual({ data: tempFilePath })
    expect(result).toBe(false)
  })
})
