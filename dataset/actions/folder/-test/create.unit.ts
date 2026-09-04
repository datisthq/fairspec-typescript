import * as fs from "node:fs/promises"
import * as path from "node:path"
import { describe, expect, it } from "vite-plus/test"
import { createFolder } from "../create.ts"
import { getTempFolderPath } from "../temp.ts"

describe("createFolder", () => {
  it("should create a simple folder", async () => {
    const tempDir = getTempFolderPath()
    const folderPath = path.join(tempDir, "test-folder")

    await createFolder(folderPath)

    const stats = await fs.stat(folderPath)
    expect(stats.isDirectory()).toBe(true)
  })

  it("should create nested folders", async () => {
    const tempDir = getTempFolderPath()
    const nestedPath = path.join(tempDir, "parent", "child", "grandchild")

    await createFolder(nestedPath)

    const stats = await fs.stat(nestedPath)
    expect(stats.isDirectory()).toBe(true)

    const parentStats = await fs.stat(path.join(tempDir, "parent"))
    expect(parentStats.isDirectory()).toBe(true)

    const childStats = await fs.stat(path.join(tempDir, "parent", "child"))
    expect(childStats.isDirectory()).toBe(true)
  })

  it("should not error when folder already exists", async () => {
    const tempDir = getTempFolderPath()
    const folderPath = path.join(tempDir, "existing")

    await createFolder(folderPath)
    await createFolder(folderPath)

    const stats = await fs.stat(folderPath)
    expect(stats.isDirectory()).toBe(true)
  })

  it("should create multiple levels of nested directories", async () => {
    const tempDir = getTempFolderPath()
    const deepPath = path.join(tempDir, "level1", "level2", "level3", "level4", "level5")

    await createFolder(deepPath)

    const stats = await fs.stat(deepPath)
    expect(stats.isDirectory()).toBe(true)
  })

  it("should create folder with special characters in name", async () => {
    const tempDir = getTempFolderPath()
    const specialPath = path.join(tempDir, "folder-with_special.chars")

    await createFolder(specialPath)

    const stats = await fs.stat(specialPath)
    expect(stats.isDirectory()).toBe(true)
  })

  it("should create sibling folders", async () => {
    const tempDir = getTempFolderPath()
    const folder1 = path.join(tempDir, "folder1")
    const folder2 = path.join(tempDir, "folder2")
    const folder3 = path.join(tempDir, "folder3")

    await createFolder(folder1)
    await createFolder(folder2)
    await createFolder(folder3)

    const stats1 = await fs.stat(folder1)
    const stats2 = await fs.stat(folder2)
    const stats3 = await fs.stat(folder3)

    expect(stats1.isDirectory()).toBe(true)
    expect(stats2.isDirectory()).toBe(true)
    expect(stats3.isDirectory()).toBe(true)
  })

  it("should create folder when parent exists but child does not", async () => {
    const tempDir = getTempFolderPath()
    const parentPath = path.join(tempDir, "parent")
    const childPath = path.join(parentPath, "child")

    await createFolder(parentPath)
    await createFolder(childPath)

    const stats = await fs.stat(childPath)
    expect(stats.isDirectory()).toBe(true)
  })

  it("should handle creating the same nested path multiple times", async () => {
    const tempDir = getTempFolderPath()
    const nestedPath = path.join(tempDir, "a", "b", "c")

    await createFolder(nestedPath)
    await createFolder(nestedPath)
    await createFolder(nestedPath)

    const stats = await fs.stat(nestedPath)
    expect(stats.isDirectory()).toBe(true)
  })

  it("should create folder with unicode characters", async () => {
    const tempDir = getTempFolderPath()
    const unicodePath = path.join(tempDir, "folder-世界")

    await createFolder(unicodePath)

    const stats = await fs.stat(unicodePath)
    expect(stats.isDirectory()).toBe(true)
  })

  it("should create complex directory structure", async () => {
    const tempDir = getTempFolderPath()
    const structure = [
      path.join(tempDir, "project", "src", "components"),
      path.join(tempDir, "project", "src", "utils"),
      path.join(tempDir, "project", "tests", "unit"),
      path.join(tempDir, "project", "tests", "integration"),
    ]

    for (const dirPath of structure) {
      await createFolder(dirPath)
    }

    for (const dirPath of structure) {
      const stats = await fs.stat(dirPath)
      expect(stats.isDirectory()).toBe(true)
    }
  })
})
