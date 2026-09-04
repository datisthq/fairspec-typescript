import { writeTempFile } from "@fairspec/dataset"
import type { Resource } from "@fairspec/metadata"
import { describe, expect, it } from "vite-plus/test"
import { inferCsvFileDialect } from "../infer.ts"

describe("inferCsvFileDialect", () => {
  it("should infer a simple CSV file", async () => {
    const path = await writeTempFile("id,name\n1,english\n2,中文")
    const fileDialect = await inferCsvFileDialect({ data: path })

    expect(fileDialect).toEqual({
      format: "csv",
      delimiter: ",",
      headerRows: [1],
      lineTerminator: "\n",
    })
  })

  it("should infer quoteChar", async () => {
    const path = await writeTempFile('id,name\n1,"John Doe"\n2,"Jane Smith"')
    const fileDialect = await inferCsvFileDialect({ data: path })

    expect(fileDialect).toEqual({
      format: "csv",
      delimiter: ",",
      quoteChar: '"',
      headerRows: [1],
      lineTerminator: "\n",
    })
  })

  it("should infer quoteChar with single quotes", async () => {
    const path = await writeTempFile("id,name\n1,'John Doe'\n2,'Jane Smith'")
    const fileDialect = await inferCsvFileDialect({ data: path })

    expect(fileDialect).toEqual({
      format: "csv",
      delimiter: ",",
      quoteChar: "'",
      headerRows: [1],
      lineTerminator: "\n",
    })
  })

  it("should infer header false when no header present", async () => {
    const path = await writeTempFile("1,english\n2,中文\n3,español")
    const fileDialect = await inferCsvFileDialect({ data: path })

    expect(fileDialect).toEqual({
      format: "csv",
      delimiter: ",",
      headerRows: false,
      lineTerminator: "\n",
    })
  })

  it("should detect header when header is present", async () => {
    const path = await writeTempFile("id,name\n1,english\n2,中文")
    const fileDialect = await inferCsvFileDialect({ data: path })

    expect(fileDialect).toEqual({
      format: "csv",
      delimiter: ",",
      headerRows: [1],
      lineTerminator: "\n",
    })
  })

  it("should infer complex CSV with quotes and header", async () => {
    const path = await writeTempFile(
      'name,description\n"Product A","A great product with, commas"\n"Product B","Another product"',
    )

    const fileDialect = await inferCsvFileDialect({ data: path })
    expect(fileDialect).toEqual({
      format: "csv",
      delimiter: ",",
      quoteChar: '"',
      headerRows: [1],
      lineTerminator: "\n",
    })
  })

  it("should infer dialect from CSV file with comma delimiter", async () => {
    const path = await writeTempFile("id,name,age\n1,alice,25\n2,bob,30")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const fileDialect = await inferCsvFileDialect(resource)
    expect(fileDialect).toEqual({
      format: "csv",
      delimiter: ",",
      headerRows: [1],
      lineTerminator: "\n",
    })
  })

  it("should infer dialect from CSV file with pipe delimiter", async () => {
    const path = await writeTempFile("id|name|age\n1|alice|25\n2|bob|30")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const fileDialect = await inferCsvFileDialect(resource)
    expect(fileDialect).toEqual({
      format: "csv",
      delimiter: "|",
      headerRows: [1],
      lineTerminator: "\n",
    })
  })

  it("should infer dialect from CSV file with semicolon delimiter", async () => {
    const path = await writeTempFile("id;name;age\n1;alice;25\n2;bob;30")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const fileDialect = await inferCsvFileDialect(resource)
    expect(fileDialect).toEqual({
      format: "csv",
      delimiter: ";",
      headerRows: [1],
      lineTerminator: "\n",
    })
  })

  it("should infer dialect from TSV file with tab delimiter", async () => {
    const path = await writeTempFile("id\tname\tage\n1\talice\t25\n2\tbob\t30")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const fileDialect = await inferCsvFileDialect(resource)
    expect(fileDialect).toEqual({
      format: "tsv",
      headerRows: [1],
      lineTerminator: "\n",
    })
  })

  it("should handle CSV with quoted fields", async () => {
    const path = await writeTempFile(
      'id,name,description\n1,"alice","Description with, comma"\n2,"bob","Normal text"',
    )

    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const fileDialect = await inferCsvFileDialect(resource)
    expect(fileDialect).toEqual({
      format: "csv",
      delimiter: ",",
      quoteChar: '"',
      headerRows: [1],
      lineTerminator: "\n",
    })
  })

  it("should handle CSV with different quote character", async () => {
    const path = await writeTempFile(
      "id,name,description\n1,'alice','Description text'\n2,'bob','Normal text'",
    )

    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const fileDialect = await inferCsvFileDialect(resource)
    expect(fileDialect).toEqual({
      format: "csv",
      delimiter: ",",
      quoteChar: "'",
      headerRows: [1],
      lineTerminator: "\n",
    })
  })

  it("should handle resources without path", async () => {
    const resource: Resource = {
      data: [
        { id: 1, name: "alice" },
        { id: 2, name: "bob" },
      ],
    }

    const fileDialect = await inferCsvFileDialect(resource)
    expect(fileDialect).toBeUndefined()
  })

  it("should return empty object for non-CSV resources", async () => {
    const resource: Resource = {
      fileDialect: { format: "json" },
      data: [{ id: 1 }],
    }

    const fileDialect = await inferCsvFileDialect(resource)
    expect(fileDialect).toBeUndefined()
  })

  it("should handle CSV with custom line terminator", async () => {
    const path = await writeTempFile("id,name\r\n1,alice\r\n2,bob\r\n")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const fileDialect = await inferCsvFileDialect(resource)
    expect(fileDialect).toEqual({
      format: "csv",
      delimiter: ",",
      headerRows: [1],
      lineTerminator: "\r\n",
    })
  })

  it("should handle CSV with header row only", async () => {
    const path = await writeTempFile("id,name,age")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const fileDialect = await inferCsvFileDialect(resource)
    expect(fileDialect).toEqual({
      format: "csv",
      delimiter: ",",
      headerRows: false,
      lineTerminator: "\n",
    })
  })

  it("should handle empty CSV file", async () => {
    const path = await writeTempFile("")
    const resource: Resource = { data: path, fileDialect: { format: "csv" } }

    const fileDialect = await inferCsvFileDialect(resource)
    expect(fileDialect).toEqual({
      format: "csv",
      delimiter: ",",
      lineTerminator: "\n",
    })
  })

  describe("Header Detection", () => {
    it("should detect header row in CSV with mixed types", async () => {
      const path = await writeTempFile("id,name,age\n1,Alice,25\n2,Bob,30\n3,Charlie,35")
      const fileDialect = await inferCsvFileDialect({ data: path })

      expect(fileDialect).toEqual({
        format: "csv",
        delimiter: ",",
        headerRows: [1],
        lineTerminator: "\n",
      })
    })

    it("should detect header after preamble rows", async () => {
      const path = await writeTempFile(
        "# Comment line 1\n# Comment line 2\nid,name,age\n1,Alice,25\n2,Bob,30",
      )
      const fileDialect = await inferCsvFileDialect({ data: path })

      expect(fileDialect).toEqual({
        format: "csv",
        delimiter: ",",
        headerRows: [3],
        lineTerminator: "\n",
      })
    })

    it("should not detect header when first row is numeric", async () => {
      const path = await writeTempFile("1,2,3\n4,5,6\n7,8,9")
      const fileDialect = await inferCsvFileDialect({ data: path })

      expect(fileDialect).toEqual({
        format: "csv",
        delimiter: ",",
        headerRows: false,
        lineTerminator: "\n",
      })
    })

    it("should detect header with underscores and mixed case", async () => {
      const path = await writeTempFile(
        "user_id,User_Name,EmailAddress\n1,alice,alice@example.com\n2,bob,bob@example.com",
      )
      const fileDialect = await inferCsvFileDialect({ data: path })

      expect(fileDialect).toEqual({
        format: "csv",
        delimiter: ",",
        headerRows: [1],
        lineTerminator: "\n",
      })
    })

    it("should not detect header when first row has data-like values", async () => {
      const path = await writeTempFile(
        "blsrpxedd,37257,695.80,false,1927-11-07T01:03:54Z\nzmvpq03o4,68694,337.73,false,1927-04-02T12:37:52Z\niw1fm3k9n,52019,988.74,false,2009-02-22T05:50:15Z",
      )
      const fileDialect = await inferCsvFileDialect({ data: path })

      expect(fileDialect).toEqual({
        format: "csv",
        delimiter: ",",
        headerRows: false,
        lineTerminator: "\n",
      })
    })
  })
})
