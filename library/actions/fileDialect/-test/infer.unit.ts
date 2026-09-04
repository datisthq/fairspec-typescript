import { writeTempFile } from "@fairspec/dataset"
import type { CsvFileDialect, Resource } from "@fairspec/metadata"
import { describe, expect, it } from "vite-plus/test"
import { inferFileDialect } from "../infer.ts"

describe("inferFileDialect", () => {
  it("should infer CSV format", async () => {
    const path = await writeTempFile("id,name,age\n1,alice,25\n2,bob,30")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const fileDialect = await inferFileDialect(resource)
    expect(fileDialect).toEqual<CsvFileDialect>({
      format: "csv",
      delimiter: ",",
      headerRows: [1],
      lineTerminator: "\n",
    })
  })

  it("should infer TSV format", async () => {
    const path = await writeTempFile("id\tname\tage\n1\talice\t25\n2\tbob\t30")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const fileDialect = await inferFileDialect(resource)
    expect(fileDialect).toEqual({
      format: "tsv",
      headerRows: [1],
      lineTerminator: "\n",
    })
  })

  it("should infer JSON format", async () => {
    const path = await writeTempFile(JSON.stringify([{ id: 1, name: "alice" }]))
    const resource: Resource = { data: path, fileDialect: { format: "json" } }

    const fileDialect = await inferFileDialect(resource)
    expect(fileDialect).toEqual({
      format: "json",
      rowType: "object",
    })
  })

  it("should return undefined for inline data", async () => {
    const resource: Resource = {
      data: [{ id: 1 }],
    }

    const fileDialect = await inferFileDialect(resource)
    expect(fileDialect).toBeUndefined()
  })
})
