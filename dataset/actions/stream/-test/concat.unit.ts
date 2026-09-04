import { Readable } from "node:stream"
import { describe, expect, it } from "vite-plus/test"
import { concatFileStreams } from "../concat.ts"

describe("concatFileStreams", () => {
  it("should concatenate multiple streams in order", async () => {
    const stream1 = Readable.from(["Hello, "])
    const stream2 = Readable.from(["World"])
    const stream3 = Readable.from(["!"])

    const concatenated = concatFileStreams([stream1, stream2, stream3])

    const chunks: Buffer[] = []
    for await (const chunk of concatenated) {
      chunks.push(chunk)
    }

    const result = Buffer.concat(chunks).toString("utf-8")
    expect(result).toBe("Hello, World!")
  })

  it("should handle single stream", async () => {
    const stream = Readable.from(["Single stream content"])

    const concatenated = concatFileStreams([stream])

    const chunks: Buffer[] = []
    for await (const chunk of concatenated) {
      chunks.push(chunk)
    }

    const result = Buffer.concat(chunks).toString("utf-8")
    expect(result).toBe("Single stream content")
  })

  it("should handle empty array of streams", async () => {
    const concatenated = concatFileStreams([])

    const chunks: Buffer[] = []
    for await (const chunk of concatenated) {
      chunks.push(chunk)
    }

    const result = Buffer.concat(chunks).toString("utf-8")
    expect(result).toBe("")
  })

  it("should handle streams with empty content", async () => {
    const stream1 = Readable.from([])
    const stream2 = Readable.from(["Content"])
    const stream3 = Readable.from([])

    const concatenated = concatFileStreams([stream1, stream2, stream3])

    const chunks: Buffer[] = []
    for await (const chunk of concatenated) {
      chunks.push(chunk)
    }

    const result = Buffer.concat(chunks).toString("utf-8")
    expect(result).toBe("Content")
  })

  it("should concatenate streams with multiple chunks", async () => {
    const stream1 = Readable.from(["A", "B", "C"])
    const stream2 = Readable.from(["D", "E", "F"])

    const concatenated = concatFileStreams([stream1, stream2])

    const chunks: Buffer[] = []
    for await (const chunk of concatenated) {
      chunks.push(chunk)
    }

    const result = Buffer.concat(chunks).toString("utf-8")
    expect(result).toBe("ABCDEF")
  })

  it("should handle binary data streams", async () => {
    const data1 = Buffer.from([0x00, 0x01, 0x02])
    const data2 = Buffer.from([0x03, 0x04, 0x05])
    const stream1 = Readable.from([data1])
    const stream2 = Readable.from([data2])

    const concatenated = concatFileStreams([stream1, stream2])

    const chunks: Buffer[] = []
    for await (const chunk of concatenated) {
      chunks.push(chunk)
    }

    const result = Buffer.concat(chunks)
    expect(result).toEqual(Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05]))
  })

  it("should handle large streams", async () => {
    const content1 = "A".repeat(5000)
    const content2 = "B".repeat(5000)
    const stream1 = Readable.from([content1])
    const stream2 = Readable.from([content2])

    const concatenated = concatFileStreams([stream1, stream2])

    const chunks: Buffer[] = []
    for await (const chunk of concatenated) {
      chunks.push(chunk)
    }

    const result = Buffer.concat(chunks).toString("utf-8")
    expect(result.length).toBe(10000)
    expect(result).toBe(content1 + content2)
  })

  it("should preserve unicode characters", async () => {
    const stream1 = Readable.from(["Hello 世界"])
    const stream2 = Readable.from([" مرحبا"])
    const stream3 = Readable.from([" 🌍"])

    const concatenated = concatFileStreams([stream1, stream2, stream3])

    const chunks: Buffer[] = []
    for await (const chunk of concatenated) {
      chunks.push(chunk)
    }

    const result = Buffer.concat(chunks).toString("utf-8")
    expect(result).toBe("Hello 世界 مرحبا 🌍")
  })

  it("should handle JSON data streams", async () => {
    const obj1 = { name: "Alice", age: 30 }
    const obj2 = { name: "Bob", age: 25 }
    const stream1 = Readable.from([JSON.stringify(obj1)])
    const stream2 = Readable.from([","])
    const stream3 = Readable.from([JSON.stringify(obj2)])

    const concatenated = concatFileStreams([stream1, stream2, stream3])

    const chunks: Buffer[] = []
    for await (const chunk of concatenated) {
      chunks.push(chunk)
    }

    const result = Buffer.concat(chunks).toString("utf-8")
    expect(result).toBe(`${JSON.stringify(obj1)},${JSON.stringify(obj2)}`)
  })

  it("should handle streams with newlines and special characters", async () => {
    const stream1 = Readable.from(["Line 1\n"])
    const stream2 = Readable.from(["Line 2\r\n"])
    const stream3 = Readable.from(["Line 3\t"])

    const concatenated = concatFileStreams([stream1, stream2, stream3])

    const chunks: Buffer[] = []
    for await (const chunk of concatenated) {
      chunks.push(chunk)
    }

    const result = Buffer.concat(chunks).toString("utf-8")
    expect(result).toBe("Line 1\nLine 2\r\nLine 3\t")
  })

  it("should maintain stream order with many streams", async () => {
    const streams = Array.from({ length: 10 }, (_, i) => Readable.from([String(i)]))

    const concatenated = concatFileStreams(streams)

    const chunks: Buffer[] = []
    for await (const chunk of concatenated) {
      chunks.push(chunk)
    }

    const result = Buffer.concat(chunks).toString("utf-8")
    expect(result).toBe("0123456789")
  })

  it("should handle mixed content types", async () => {
    const textStream = Readable.from(["Text: "])
    const numberStream = Readable.from(["123"])
    const binaryStream = Readable.from([Buffer.from([0x20, 0x2d, 0x20])])
    const unicodeStream = Readable.from(["🎉"])

    const concatenated = concatFileStreams([
      textStream,
      numberStream,
      binaryStream,
      unicodeStream,
    ])

    const chunks: Buffer[] = []
    for await (const chunk of concatenated) {
      chunks.push(chunk)
    }

    const result = Buffer.concat(chunks).toString("utf-8")
    expect(result).toBe("Text: 123 - 🎉")
  })
})
