import { describe, expect, it } from "vite-plus/test"
import { writeTempFile } from "../../file/temp.ts"
import { loadFileStream } from "../load.ts"

describe("loadFileStream", () => {
  it("should load stream from a single local file path", async () => {
    const content = "Hello, World!"
    const filePath = await writeTempFile(content)

    const stream = await loadFileStream(filePath)

    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }

    const result = Buffer.concat(chunks).toString("utf-8")
    expect(result).toBe(content)
  })

  it("should load stream from array of paths using default index", async () => {
    const content1 = "First file content"
    const content2 = "Second file content"
    const file1 = await writeTempFile(content1)
    const file2 = await writeTempFile(content2)

    const stream = await loadFileStream([file1, file2])

    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }

    const result = Buffer.concat(chunks).toString("utf-8")
    expect(result).toBe(content1)
  })

  it("should load stream from array of paths using specified index", async () => {
    const content1 = "First file content"
    const content2 = "Second file content"
    const file1 = await writeTempFile(content1)
    const file2 = await writeTempFile(content2)

    const stream = await loadFileStream([file1, file2], { index: 1 })

    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }

    const result = Buffer.concat(chunks).toString("utf-8")
    expect(result).toBe(content2)
  })

  it("should limit stream to maxBytes for local files", async () => {
    const content = "This is a long content that should be truncated"
    const filePath = await writeTempFile(content)
    const maxBytes = 10

    const stream = await loadFileStream(filePath, { maxBytes })

    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }

    const result = Buffer.concat(chunks).toString("utf-8")
    expect(result).toBe(content.substring(0, maxBytes))
    expect(result.length).toBe(maxBytes)
  })

  it("should throw error for invalid index", async () => {
    const filePath = await writeTempFile("content")

    await expect(loadFileStream([filePath], { index: 5 })).rejects.toThrow(
      "Cannot stream resource",
    )
  })

  it("should throw error for empty array with index 0", async () => {
    await expect(loadFileStream([], { index: 0 })).rejects.toThrow(
      "Cannot stream resource",
    )
  })

  it("should handle large files", async () => {
    const largeContent = "A".repeat(10000)
    const filePath = await writeTempFile(largeContent)

    const stream = await loadFileStream(filePath)

    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }

    const result = Buffer.concat(chunks).toString("utf-8")
    expect(result.length).toBe(10000)
    expect(result).toBe(largeContent)
  })

  it("should handle binary content", async () => {
    const binaryData = Buffer.from([0x00, 0x01, 0x02, 0x03, 0xff])
    const filePath = await writeTempFile(binaryData)

    const stream = await loadFileStream(filePath)

    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }

    const result = Buffer.concat(chunks)
    expect(result).toEqual(binaryData)
  })

  it("should handle empty files", async () => {
    const filePath = await writeTempFile("")

    const stream = await loadFileStream(filePath)

    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }

    const result = Buffer.concat(chunks).toString("utf-8")
    expect(result).toBe("")
  })

  it("should limit bytes correctly for files larger than maxBytes", async () => {
    const content = "0123456789ABCDEFGHIJ"
    const filePath = await writeTempFile(content)

    const stream = await loadFileStream(filePath, { maxBytes: 5 })

    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }

    const result = Buffer.concat(chunks).toString("utf-8")
    expect(result).toBe("01234")
  })

  it("should handle maxBytes larger than file size", async () => {
    const content = "Short"
    const filePath = await writeTempFile(content)

    const stream = await loadFileStream(filePath, { maxBytes: 1000 })

    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }

    const result = Buffer.concat(chunks).toString("utf-8")
    expect(result).toBe(content)
  })
})
