import type { CsvFileDialect, Resource } from "@fairspec/library"
import { writeTempFile } from "@fairspec/library"
import { describe, expect, it } from "vite-plus/test"
import { inferFileDialectTool } from "./infer.ts"

describe("inferFileDialectTool", () => {
  it("validates tool structure", () => {
    expect(inferFileDialectTool.id).toBe("infer-file-dialect")
    expect(inferFileDialectTool.description).toBeTruthy()
    expect(inferFileDialectTool.inputSchema).toBeTruthy()
    expect(inferFileDialectTool.outputSchema).toBeTruthy()
    expect(inferFileDialectTool.execute).toBeTypeOf("function")
  })

  it("infers CSV format", async () => {
    const path = await writeTempFile("id,name,age\n1,alice,25\n2,bob,30")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const result = await inferFileDialectTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.fileDialect).toEqual<CsvFileDialect>({
      format: "csv",
      delimiter: ",",
      headerRows: [1],
      lineTerminator: "\n",
    })
  })

  it("infers TSV format", async () => {
    const path = await writeTempFile("id\tname\tage\n1\talice\t25\n2\tbob\t30")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const result = await inferFileDialectTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.fileDialect).toEqual({
      format: "tsv",
      headerRows: [1],
      lineTerminator: "\n",
    })
  })

  it("infers JSON format with array of objects", async () => {
    const path = await writeTempFile(JSON.stringify([{ id: 1, name: "alice" }]))
    const resource: Resource = { data: path, fileDialect: { format: "json" } }

    const result = await inferFileDialectTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.fileDialect).toEqual({
      format: "json",
      rowType: "object",
    })
  })

  it("infers JSON format with array of arrays", async () => {
    const path = await writeTempFile(
      JSON.stringify([
        [1, "alice"],
        [2, "bob"],
      ]),
    )
    const resource: Resource = { data: path, fileDialect: { format: "json" } }

    const result = await inferFileDialectTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.fileDialect?.format).toBe("json")
    expect(result.fileDialect).toHaveProperty("rowType")
  })

  it("infers JSONL format", async () => {
    const path = await writeTempFile('{"id":1,"name":"alice"}\n{"id":2,"name":"bob"}')
    const resource: Resource = { data: path, fileDialect: { format: "jsonl" } }

    const result = await inferFileDialectTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.fileDialect?.format).toBe("jsonl")
  })

  it("infers CSV with different delimiter", async () => {
    const path = await writeTempFile("id;name;age\n1;alice;25\n2;bob;30")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const result = await inferFileDialectTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.fileDialect).toMatchObject({
      format: "csv",
      delimiter: ";",
    })
  })

  it("infers CSV without headers", async () => {
    const path = await writeTempFile("1,alice,25\n2,bob,30")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const result = await inferFileDialectTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.fileDialect?.format).toBe("csv")
    expect(result.fileDialect).toHaveProperty("delimiter")
  })

  it("returns undefined for inline data", async () => {
    const resource: Resource = {
      data: [{ id: 1 }],
    }

    const result = await inferFileDialectTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.fileDialect).toBeUndefined()
  })

  it("respects sampleBytes option", async () => {
    const largeData = Array.from({ length: 1000 }, (_, i) => `${i},row${i}`).join("\n")
    const path = await writeTempFile(`id,name\n${largeData}`)
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const result = await inferFileDialectTool.execute?.(
      {
        resource,
        options: { sampleBytes: 1000 },
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.fileDialect?.format).toBe("csv")
  })

  it("infers dialect with provided format hint", async () => {
    const path = await writeTempFile("id,name\n1,alice\n2,bob")
    const resource: Resource = {
      data: path,
      fileDialect: { format: "csv" },
    }

    const result = await inferFileDialectTool.execute?.(
      {
        resource,
      },
      {},
    )

    expect.assert(result)
    expect.assert(!("error" in result))

    expect(result.fileDialect?.format).toBe("csv")
    expect(result.fileDialect).toHaveProperty("delimiter")
  })
})
