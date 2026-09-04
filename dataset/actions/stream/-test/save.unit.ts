import * as fs from "node:fs/promises"
import * as path from "node:path"
import { Readable } from "node:stream"
import { describe, expect, it } from "vite-plus/test"
import { getTempFolderPath } from "../../folder/temp.ts"
import { saveFileStream } from "../save.ts"

describe("saveFileStream", () => {
  it("should save stream to file", async () => {
    const content = "Hello, World!"
    const stream = Readable.from([content])
    const tempDir = getTempFolderPath()
    const filePath = path.join(tempDir, "test.txt")

    await saveFileStream(stream, { path: filePath })

    const fileExists = await fs
      .stat(filePath)
      .then(() => true)
      .catch(() => false)
    expect(fileExists).toBe(true)

    const savedContent = await fs.readFile(filePath, "utf-8")
    expect(savedContent).toBe(content)
  })

  it("should save stream with multiple chunks", async () => {
    const chunks = ["Hello, ", "World", "!"]
    const stream = Readable.from(chunks)
    const tempDir = getTempFolderPath()
    const filePath = path.join(tempDir, "chunks.txt")

    await saveFileStream(stream, { path: filePath })

    const savedContent = await fs.readFile(filePath, "utf-8")
    expect(savedContent).toBe(chunks.join(""))
  })

  it("should create nested directories automatically", async () => {
    const content = "Nested content"
    const stream = Readable.from([content])
    const tempDir = getTempFolderPath()
    const filePath = path.join(tempDir, "nested", "dir", "file.txt")

    await saveFileStream(stream, { path: filePath })

    const savedContent = await fs.readFile(filePath, "utf-8")
    expect(savedContent).toBe(content)
  })

  it("should throw error when file exists and overwrite is false", async () => {
    const content = "Initial content"
    const stream1 = Readable.from([content])
    const tempDir = getTempFolderPath()
    const filePath = path.join(tempDir, "existing.txt")

    await saveFileStream(stream1, { path: filePath })

    const stream2 = Readable.from(["New content"])
    await expect(
      saveFileStream(stream2, { path: filePath, overwrite: false }),
    ).rejects.toThrow()
  })

  it("should throw error when file exists and overwrite is not specified", async () => {
    const content = "Initial content"
    const stream1 = Readable.from([content])
    const tempDir = getTempFolderPath()
    const filePath = path.join(tempDir, "existing2.txt")

    await saveFileStream(stream1, { path: filePath })

    const stream2 = Readable.from(["New content"])
    await expect(saveFileStream(stream2, { path: filePath })).rejects.toThrow()
  })

  it("should overwrite file when overwrite is true", async () => {
    const initialContent = "Initial content"
    const newContent = "New content"
    const stream1 = Readable.from([initialContent])
    const tempDir = getTempFolderPath()
    const filePath = path.join(tempDir, "overwrite.txt")

    await saveFileStream(stream1, { path: filePath })

    const initialSaved = await fs.readFile(filePath, "utf-8")
    expect(initialSaved).toBe(initialContent)

    const stream2 = Readable.from([newContent])
    await saveFileStream(stream2, { path: filePath, overwrite: true })

    const newSaved = await fs.readFile(filePath, "utf-8")
    expect(newSaved).toBe(newContent)
  })

  it("should save binary data stream", async () => {
    const binaryData = Buffer.from([0x00, 0x01, 0x02, 0x03, 0xff])
    const stream = Readable.from([binaryData])
    const tempDir = getTempFolderPath()
    const filePath = path.join(tempDir, "binary.bin")

    await saveFileStream(stream, { path: filePath })

    const savedData = await fs.readFile(filePath)
    expect(savedData).toEqual(binaryData)
  })

  it("should save empty stream", async () => {
    const stream = Readable.from([])
    const tempDir = getTempFolderPath()
    const filePath = path.join(tempDir, "empty.txt")

    await saveFileStream(stream, { path: filePath })

    const savedContent = await fs.readFile(filePath, "utf-8")
    expect(savedContent).toBe("")
  })

  it("should save large stream", async () => {
    const largeContent = "A".repeat(10000)
    const stream = Readable.from([largeContent])
    const tempDir = getTempFolderPath()
    const filePath = path.join(tempDir, "large.txt")

    await saveFileStream(stream, { path: filePath })

    const savedContent = await fs.readFile(filePath, "utf-8")
    expect(savedContent).toBe(largeContent)
    expect(savedContent.length).toBe(10000)
  })

  it("should save stream with special characters", async () => {
    const content = "Special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?"
    const stream = Readable.from([content])
    const tempDir = getTempFolderPath()
    const filePath = path.join(tempDir, "special.txt")

    await saveFileStream(stream, { path: filePath })

    const savedContent = await fs.readFile(filePath, "utf-8")
    expect(savedContent).toBe(content)
  })

  it("should save stream with unicode characters", async () => {
    const content = "Unicode: 你好世界 🌍 مرحبا"
    const stream = Readable.from([content])
    const tempDir = getTempFolderPath()
    const filePath = path.join(tempDir, "unicode.txt")

    await saveFileStream(stream, { path: filePath })

    const savedContent = await fs.readFile(filePath, "utf-8")
    expect(savedContent).toBe(content)
  })

  it("should save JSON data stream", async () => {
    const jsonData = { name: "test", value: 123, nested: { key: "value" } }
    const jsonString = JSON.stringify(jsonData)
    const stream = Readable.from([jsonString])
    const tempDir = getTempFolderPath()
    const filePath = path.join(tempDir, "data.json")

    await saveFileStream(stream, { path: filePath })

    const savedContent = await fs.readFile(filePath, "utf-8")
    const parsedData = JSON.parse(savedContent)
    expect(parsedData).toEqual(jsonData)
  })
})
