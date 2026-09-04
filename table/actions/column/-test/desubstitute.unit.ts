import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { denormalizeTable } from "../../../actions/table/denormalize.ts"

describe("desubstituteColumn", () => {
  describe("string missing values", () => {
    it.each([
      [null, null],
      ["hello", "hello"],
      ["value", "value"],
    ])("no missing values: %s -> %s", async (value, expected) => {
      const table = pl.DataFrame([pl.Series("name", [value], pl.String)]).lazy()
      const tableSchema: TableSchema = {
        properties: {
          name: { type: "string" },
        },
      }

      const result = await denormalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.toRecords()[0]?.name
      expect(actual).toEqual(expected)
    })

    it.each([
      [null, null],
      ["hello", "hello"],
      ["value", "value"],
    ])("schema-level empty array: %s -> %s", async (value, expected) => {
      const table = pl.DataFrame([pl.Series("name", [value], pl.String)]).lazy()
      const tableSchema: TableSchema = {
        missingValues: [],
        properties: {
          name: { type: "string" },
        },
      }

      const result = await denormalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.toRecords()[0]?.name
      expect(actual).toEqual(expected)
    })

    it.each([
      [null, "-"],
      ["hello", "hello"],
      ["value", "value"],
    ])('schema-level ["-"]: %s -> %s', async (value, expected) => {
      const table = pl.DataFrame([pl.Series("name", [value], pl.String)]).lazy()
      const tableSchema: TableSchema = {
        missingValues: ["-"],
        properties: {
          name: { type: "string" },
        },
      }

      const result = await denormalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.toRecords()[0]?.name
      expect(actual).toEqual(expected)
    })

    it.each([
      [null, "x"],
      ["hello", "hello"],
      ["value", "value"],
    ])('schema-level ["x"]: %s -> %s', async (value, expected) => {
      const table = pl.DataFrame([pl.Series("name", [value], pl.String)]).lazy()
      const tableSchema: TableSchema = {
        missingValues: ["x"],
        properties: {
          name: { type: "string" },
        },
      }

      const result = await denormalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.toRecords()[0]?.name
      expect(actual).toEqual(expected)
    })

    it.each([
      [null, "-"],
      ["test", "test"],
      ["value", "value"],
    ])('column-level ["-"]: %s -> %s', async (value, expected) => {
      const table = pl.DataFrame([pl.Series("name", [value], pl.String)]).lazy()
      const tableSchema: TableSchema = {
        properties: {
          name: { type: "string", missingValues: ["-"] },
        },
      }

      const result = await denormalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.toRecords()[0]?.name
      expect(actual).toEqual(expected)
    })

    it.each([
      [null, "n/a"],
      ["value", "value"],
      ["test", "test"],
    ])('column-level ["n/a"]: %s -> %s', async (value, expected) => {
      const table = pl.DataFrame([pl.Series("name", [value], pl.String)]).lazy()
      const tableSchema: TableSchema = {
        properties: {
          name: { type: "string", missingValues: ["n/a"] },
        },
      }

      const result = await denormalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.toRecords()[0]?.name
      expect(actual).toEqual(expected)
    })

    it.each([
      [null, "-"],
      ["hello", "hello"],
      ["value", "value"],
    ])('schema-level ["x"] + column-level ["-"]: %s -> %s', async (value, expected) => {
      const table = pl.DataFrame([pl.Series("name", [value], pl.String)]).lazy()
      const tableSchema: TableSchema = {
        missingValues: ["x"],
        properties: {
          name: { type: "string", missingValues: ["-"] },
        },
      }

      const result = await denormalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.toRecords()[0]?.name
      expect(actual).toEqual(expected)
    })

    it.each([
      [null, "x"],
      ["hello", "hello"],
      ["value", "value"],
    ])('schema-level ["-"] + column-level ["x"]: %s -> %s', async (value, expected) => {
      const table = pl.DataFrame([pl.Series("name", [value], pl.String)]).lazy()
      const tableSchema: TableSchema = {
        missingValues: ["-"],
        properties: {
          name: { type: "string", missingValues: ["x"] },
        },
      }

      const result = await denormalizeTable(table, tableSchema)
      const frame = await result.collect()

      const actual = frame.toRecords()[0]?.name
      expect(actual).toEqual(expected)
    })

    it.each([
      [null, "-"],
      ["value", "value"],
      ["test", "test"],
    ])(
      'column-level ["-", "n/a", "null"] (uses first): %s -> %s',
      async (value, expected) => {
        const table = pl.DataFrame([pl.Series("name", [value], pl.String)]).lazy()
        const tableSchema: TableSchema = {
          properties: {
            name: { type: "string", missingValues: ["-", "n/a", "null"] },
          },
        }

        const result = await denormalizeTable(table, tableSchema)
        const frame = await result.collect()

        const actual = frame.toRecords()[0]?.name
        expect(actual).toEqual(expected)
      },
    )

    it.each([
      [null, "n/a"],
      ["value", "value"],
      ["test", "test"],
    ])(
      'schema-level ["n/a", "NULL", ""] (uses first): %s -> %s',
      async (value, expected) => {
        const table = pl.DataFrame([pl.Series("name", [value], pl.String)]).lazy()
        const tableSchema: TableSchema = {
          missingValues: ["n/a", "NULL", ""],
          properties: {
            name: { type: "string" },
          },
        }

        const result = await denormalizeTable(table, tableSchema)
        const frame = await result.collect()

        const actual = frame.toRecords()[0]?.name
        expect(actual).toEqual(expected)
      },
    )

    it.each([
      [null, "-"],
      ["value", "value"],
      ["test", "test"],
    ])(
      'column-level ["-"] + schema-level [""] (column takes precedence): %s -> %s',
      async (value, expected) => {
        const table = pl.DataFrame([pl.Series("name", [value], pl.String)]).lazy()
        const tableSchema: TableSchema = {
          missingValues: [""],
          properties: {
            name: { type: "string", missingValues: ["-"] },
          },
        }

        const result = await denormalizeTable(table, tableSchema)
        const frame = await result.collect()

        const actual = frame.toRecords()[0]?.name
        expect(actual).toEqual(expected)
      },
    )
  })

  describe("integer missing values", () => {
    it.each([
      [null, -1],
      [0, 0],
      [1, 1],
      [42, 42],
    ])("schema-level [-1]: %s -> %s", async (value, expected) => {
      const table = pl.DataFrame([pl.Series("value", [value], pl.Int64)]).lazy()
      const tableSchema: TableSchema = {
        missingValues: [-1],
        properties: {
          value: { type: "integer" },
        },
      }

      const result = await denormalizeTable(table, tableSchema, {
        nativeTypes: ["integer"],
      })

      const frame = await result.collect()
      const actual = frame.toRecords()[0]?.value
      expect(actual).toEqual(expected)
    })

    it.each([
      [null, -999],
      [0, 0],
      [1, 1],
      [100, 100],
    ])("schema-level [-999]: %s -> %s", async (value, expected) => {
      const table = pl.DataFrame([pl.Series("value", [value], pl.Int64)]).lazy()
      const tableSchema: TableSchema = {
        missingValues: [-999],
        properties: {
          value: { type: "integer" },
        },
      }

      const result = await denormalizeTable(table, tableSchema, {
        nativeTypes: ["integer"],
      })

      const frame = await result.collect()
      const actual = frame.toRecords()[0]?.value
      expect(actual).toEqual(expected)
    })

    it.each([
      [null, -1],
      [0, 0],
      [5, 5],
      [999, 999],
    ])("column-level [-1]: %s -> %s", async (value, expected) => {
      const table = pl.DataFrame([pl.Series("value", [value], pl.Int64)]).lazy()
      const tableSchema: TableSchema = {
        properties: {
          value: { type: "integer", missingValues: [-1] },
        },
      }

      const result = await denormalizeTable(table, tableSchema, {
        nativeTypes: ["integer"],
      })

      const frame = await result.collect()
      const actual = frame.toRecords()[0]?.value
      expect(actual).toEqual(expected)
    })

    it.each([
      [null, -999],
      [0, 0],
      [7, 7],
      [123, 123],
    ])("column-level [-999]: %s -> %s", async (value, expected) => {
      const table = pl.DataFrame([pl.Series("value", [value], pl.Int64)]).lazy()
      const tableSchema: TableSchema = {
        properties: {
          value: { type: "integer", missingValues: [-999] },
        },
      }

      const result = await denormalizeTable(table, tableSchema, {
        nativeTypes: ["integer"],
      })

      const frame = await result.collect()
      const actual = frame.toRecords()[0]?.value
      expect(actual).toEqual(expected)
    })

    it.each([
      [null, -1],
      [0, 0],
      [42, 42],
    ])("schema-level [-99] + column-level [-1]: %s -> %s", async (value, expected) => {
      const table = pl.DataFrame([pl.Series("value", [value], pl.Int64)]).lazy()
      const tableSchema: TableSchema = {
        missingValues: [-99],
        properties: {
          value: { type: "integer", missingValues: [-1] },
        },
      }

      const result = await denormalizeTable(table, tableSchema, {
        nativeTypes: ["integer"],
      })

      const frame = await result.collect()
      const actual = frame.toRecords()[0]?.value
      expect(actual).toEqual(expected)
    })

    it.each([
      [null, -99],
      [0, 0],
      [99, 99],
    ])("schema-level [-1] + column-level [-99]: %s -> %s", async (value, expected) => {
      const table = pl.DataFrame([pl.Series("value", [value], pl.Int64)]).lazy()
      const tableSchema: TableSchema = {
        missingValues: [-1],
        properties: {
          value: { type: "integer", missingValues: [-99] },
        },
      }

      const result = await denormalizeTable(table, tableSchema, {
        nativeTypes: ["integer"],
      })

      const frame = await result.collect()
      const actual = frame.toRecords()[0]?.value
      expect(actual).toEqual(expected)
    })

    it.each([
      [null, -1],
      [0, 0],
      [1, 1],
      [42, 42],
    ])("schema-level [-1] (Float64): %s -> %s", async (value, expected) => {
      const table = pl.DataFrame([pl.Series("value", [value], pl.Float64)]).lazy()
      const tableSchema: TableSchema = {
        missingValues: [-1],
        properties: {
          value: { type: "number" },
        },
      }

      const result = await denormalizeTable(table, tableSchema, {
        nativeTypes: ["number"],
      })

      const frame = await result.collect()
      const actual = frame.toRecords()[0]?.value
      expect(actual).toEqual(expected)
    })

    it.each([
      [null, -999],
      [0, 0],
      [1, 1],
      [100, 100],
    ])("schema-level [-999] (Float64): %s -> %s", async (value, expected) => {
      const table = pl.DataFrame([pl.Series("value", [value], pl.Float64)]).lazy()
      const tableSchema: TableSchema = {
        missingValues: [-999],
        properties: {
          value: { type: "number" },
        },
      }

      const result = await denormalizeTable(table, tableSchema, {
        nativeTypes: ["number"],
      })

      const frame = await result.collect()
      const actual = frame.toRecords()[0]?.value
      expect(actual).toEqual(expected)
    })

    it.each([
      [null, -1],
      [0, 0],
      [5, 5],
      [999, 999],
    ])("column-level [-1] (Float64): %s -> %s", async (value, expected) => {
      const table = pl.DataFrame([pl.Series("value", [value], pl.Float64)]).lazy()
      const tableSchema: TableSchema = {
        properties: {
          value: { type: "number", missingValues: [-1] },
        },
      }

      const result = await denormalizeTable(table, tableSchema, {
        nativeTypes: ["number"],
      })

      const frame = await result.collect()
      const actual = frame.toRecords()[0]?.value
      expect(actual).toEqual(expected)
    })

    it.each([
      [null, -999],
      [0, 0],
      [7, 7],
      [123, 123],
    ])("column-level [-999] (Float64): %s -> %s", async (value, expected) => {
      const table = pl.DataFrame([pl.Series("value", [value], pl.Float64)]).lazy()
      const tableSchema: TableSchema = {
        properties: {
          value: { type: "number", missingValues: [-999] },
        },
      }

      const result = await denormalizeTable(table, tableSchema, {
        nativeTypes: ["number"],
      })

      const frame = await result.collect()
      const actual = frame.toRecords()[0]?.value
      expect(actual).toEqual(expected)
    })

    it.each([
      [null, -1],
      [0, 0],
      [42, 42],
    ])(
      "schema-level [-99] + column-level [-1] (Float64): %s -> %s",
      async (value, expected) => {
        const table = pl.DataFrame([pl.Series("value", [value], pl.Float64)]).lazy()
        const tableSchema: TableSchema = {
          missingValues: [-99],
          properties: {
            value: { type: "number", missingValues: [-1] },
          },
        }

        const result = await denormalizeTable(table, tableSchema, {
          nativeTypes: ["number"],
        })

        const frame = await result.collect()
        const actual = frame.toRecords()[0]?.value
        expect(actual).toEqual(expected)
      },
    )

    it.each([
      [null, -99],
      [0, 0],
      [99, 99],
    ])(
      "schema-level [-1] + column-level [-99] (Float64): %s -> %s",
      async (value, expected) => {
        const table = pl.DataFrame([pl.Series("value", [value], pl.Float64)]).lazy()
        const tableSchema: TableSchema = {
          missingValues: [-1],
          properties: {
            value: { type: "number", missingValues: [-99] },
          },
        }

        const result = await denormalizeTable(table, tableSchema, {
          nativeTypes: ["number"],
        })

        const frame = await result.collect()
        const actual = frame.toRecords()[0]?.value
        expect(actual).toEqual(expected)
      },
    )

    it.each([
      [null, -1],
      [0, 0],
      [42, 42],
    ])(
      "column-level [-1, -999, -9999] (uses first): %s -> %s",
      async (value, expected) => {
        const table = pl.DataFrame([pl.Series("value", [value], pl.Int64)]).lazy()
        const tableSchema: TableSchema = {
          properties: {
            value: { type: "integer", missingValues: [-1, -999, -9999] },
          },
        }

        const result = await denormalizeTable(table, tableSchema, {
          nativeTypes: ["integer"],
        })

        const frame = await result.collect()
        const actual = frame.toRecords()[0]?.value
        expect(actual).toEqual(expected)
      },
    )

    it.each([
      [null, -999],
      [0, 0],
      [100, 100],
    ])(
      "schema-level [-999, -9999, -99999] (uses first): %s -> %s",
      async (value, expected) => {
        const table = pl.DataFrame([pl.Series("value", [value], pl.Int64)]).lazy()
        const tableSchema: TableSchema = {
          missingValues: [-999, -9999, -99999],
          properties: {
            value: { type: "integer" },
          },
        }

        const result = await denormalizeTable(table, tableSchema, {
          nativeTypes: ["integer"],
        })

        const frame = await result.collect()
        const actual = frame.toRecords()[0]?.value
        expect(actual).toEqual(expected)
      },
    )

    it.each([
      [null, -1],
      [0, 0],
      [42, 42],
    ])(
      "column-level [-1] + schema-level [-999] (column takes precedence): %s -> %s",
      async (value, expected) => {
        const table = pl.DataFrame([pl.Series("value", [value], pl.Int64)]).lazy()
        const tableSchema: TableSchema = {
          missingValues: [-999],
          properties: {
            value: { type: "integer", missingValues: [-1] },
          },
        }

        const result = await denormalizeTable(table, tableSchema, {
          nativeTypes: ["integer"],
        })

        const frame = await result.collect()
        const actual = frame.toRecords()[0]?.value
        expect(actual).toEqual(expected)
      },
    )
  })
})
