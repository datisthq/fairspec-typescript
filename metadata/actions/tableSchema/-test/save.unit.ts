import * as fs from "node:fs/promises"
import * as path from "node:path"
import { temporaryDirectory } from "tempy"
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test"
import type { TableSchema } from "../../../models/tableSchema.ts"
import * as settings from "../../../settings.ts"
import { saveTableSchema } from "../save.ts"

describe("saveTableSchema", () => {
  const testSchema: TableSchema = {
    properties: {
      id: {
        type: "integer",
      },
      name: {
        type: "string",
      },
    },
    primaryKey: ["id"],
  }

  let testDir: string
  let testPath: string

  beforeEach(() => {
    testDir = temporaryDirectory()
    testPath = path.join(testDir, "schema.json")
  })

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true })
    } catch (error) {
      if (error instanceof Error && !error.message.includes("ENOENT")) {
        console.error(`Failed to clean up test directory: ${testDir}`, error)
      }
    }
  })

  it("should save a schema to a file and maintain its structure", async () => {
    await saveTableSchema(testSchema, { path: testPath })

    const fileExists = await fs
      .stat(testPath)
      .then(() => true)
      .catch(() => false)
    expect(fileExists).toBe(true)

    const content = await fs.readFile(testPath, "utf-8")
    const parsedContent = JSON.parse(content)

    expect(parsedContent).toEqual({
      ...testSchema,
      $schema: `https://fairspec.org/profiles/${settings.FAIRSPEC_VERSION}/table-schema.json`,
    })
  })
})
