import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { getTempFolderPath, writeTempFile } from "@fairspec/dataset"
import { describe, expect, it } from "vite-plus/test"
import { loadDataset } from "../load.ts"
import { saveDataset } from "../save.ts"

describe("saveDataset", () => {
  it("should save dataset to datapackage.json file", async () => {
    const content = JSON.stringify({
      language: "en",
      resources: [
        {
          name: "test_resource",
          data: [{ id: 1, name: "alice" }],
        },
      ],
    })

    const path = await writeTempFile(content, {
      filename: "datapackage.json",
    })

    const source = await loadDataset(path)
    const tempDir = getTempFolderPath()
    const targetPath = join(tempDir, "datapackage.json")

    await saveDataset(source, { target: targetPath })

    const saved = await readFile(targetPath, "utf-8")
    const parsed = JSON.parse(saved)

    expect(parsed.language).toBe("en")
    expect(parsed.resources).toHaveLength(1)
  })

  it("should save dataset with multiple resources", async () => {
    const content = JSON.stringify({
      resources: [
        {
          name: "resource_1",
          data: [{ id: 1, name: "alice" }],
        },
        {
          name: "resource_2",
          data: [{ id: 2, value: 100 }],
        },
      ],
    })

    const path = await writeTempFile(content, {
      filename: "datapackage.json",
    })

    const source = await loadDataset(path)
    const tempDir = getTempFolderPath()
    const targetPath = join(tempDir, "datapackage.json")

    await saveDataset(source, { target: targetPath })

    const saved = await readFile(targetPath, "utf-8")
    const parsed = JSON.parse(saved)

    expect(parsed.resources).toHaveLength(2)
  })

  it("should save dataset with tableSchema", async () => {
    const content = JSON.stringify({
      resources: [
        {
          name: "test_resource",
          data: [{ id: 1, name: "alice" }],
          tableSchema: {
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
            },
          },
        },
      ],
    })

    const path = await writeTempFile(content, {
      filename: "datapackage.json",
    })

    const source = await loadDataset(path)
    const tempDir = getTempFolderPath()
    const targetPath = join(tempDir, "datapackage.json")

    await saveDataset(source, { target: targetPath })

    const saved = await readFile(targetPath, "utf-8")
    const parsed = JSON.parse(saved)

    expect(parsed.resources?.[0]?.tableSchema).toEqual({
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
      },
    })
  })
})
