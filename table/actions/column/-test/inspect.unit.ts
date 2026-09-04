import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { inspectTable } from "../../../actions/table/inspect.ts"

describe("inspectColumn", () => {
  describe("column name validation", () => {
    it("should report an error when column names don't match", async () => {
      const table = pl
        .DataFrame({
          actual_id: [1, 2, 3],
        })
        .lazy()

      const tableSchema: TableSchema = {
        properties: {
          id: {
            type: "number",
          },
        },
      }

      const errors = await inspectTable(table, { tableSchema })

      expect(errors).toContainEqual({
        type: "column/missing",
        columnName: "id",
      })
    })

    it("should not errors when column names match", async () => {
      const table = pl
        .DataFrame({
          id: [1, 2, 3],
        })
        .lazy()

      const tableSchema: TableSchema = {
        properties: {
          id: {
            type: "number",
          },
        },
      }

      const errors = await inspectTable(table, { tableSchema })
      expect(errors).toHaveLength(0)
    })

    it("should be case-sensitive when comparing column names", async () => {
      const table = pl
        .DataFrame({
          ID: [1, 2, 3],
        })
        .lazy()

      const tableSchema: TableSchema = {
        properties: {
          id: {
            type: "number",
          },
        },
      }

      const errors = await inspectTable(table, { tableSchema })

      expect(errors).toHaveLength(1)
      expect(errors).toContainEqual({
        type: "column/missing",
        columnName: "id",
      })
    })
  })

  describe("column type validation", () => {
    it("should report an error when column types don't match", async () => {
      const table = pl
        .DataFrame({
          id: [true, false, true],
        })
        .lazy()

      const tableSchema: TableSchema = {
        properties: {
          id: {
            type: "integer",
          },
        },
      }

      const errors = await inspectTable(table, { tableSchema })

      expect(errors).toHaveLength(1)
      expect(errors).toContainEqual({
        type: "column/type",
        columnName: "id",
        expectedColumnType: "integer",
        actualColumnType: "boolean",
      })
    })

    it("should not errors when column types match", async () => {
      const table = pl
        .DataFrame({
          id: [1, 2, 3],
        })
        .lazy()

      const tableSchema: TableSchema = {
        properties: {
          id: {
            type: "number",
          },
        },
      }

      const errors = await inspectTable(table, { tableSchema })
      expect(errors).toHaveLength(0)
    })
  })

  describe("column named 'number'", () => {
    it("should not crash when data has a column named 'number'", async () => {
      const table = pl
        .DataFrame({
          name: ["Alice", "Bob", "Charlie"],
          number: [1, 2, 3],
        })
        .lazy()

      const tableSchema: TableSchema = {
        properties: {
          name: { type: "string" },
          number: { type: "integer" },
        },
      }

      const errors = await inspectTable(table, { tableSchema })
      expect(errors).toHaveLength(0)
    })

    it("should report cell errors with correct row numbers for a column named 'number'", async () => {
      const table = pl
        .DataFrame({
          name: ["Alice", "Bob", "Charlie"],
          number: ["1", "bad", "3"],
        })
        .lazy()

      const tableSchema: TableSchema = {
        properties: {
          name: { type: "string" },
          number: { type: "integer" },
        },
      }

      const errors = await inspectTable(table, { tableSchema })
      expect(errors).toContainEqual({
        type: "cell/type",
        cell: "bad",
        columnName: "number",
        columnType: "integer",
        rowNumber: 2,
      })
    })
  })

  describe("cell types validation", () => {
    it("should validate string to integer conversion errors", async () => {
      const table = pl
        .DataFrame({
          id: ["1", "bad", "3", "4x"],
        })
        .lazy()

      const tableSchema: TableSchema = {
        properties: {
          id: {
            type: "integer",
          },
        },
      }

      const errors = await inspectTable(table, { tableSchema })

      expect(errors).toHaveLength(2)
      expect(errors).toContainEqual({
        type: "cell/type",
        cell: "bad",
        columnName: "id",
        columnType: "integer",
        rowNumber: 2,
      })
      expect(errors).toContainEqual({
        type: "cell/type",
        cell: "4x",
        columnName: "id",
        columnType: "integer",
        rowNumber: 4,
      })
    })

    it("should validate string to number conversion errors", async () => {
      const table = pl
        .DataFrame({
          price: ["10.5", "twenty", "30.75", "$40"],
        })
        .lazy()

      const tableSchema: TableSchema = {
        properties: {
          price: {
            type: "number",
          },
        },
      }

      const errors = await inspectTable(table, { tableSchema })

      expect(errors).toHaveLength(2)
      expect(errors).toContainEqual({
        type: "cell/type",
        cell: "twenty",
        columnName: "price",
        columnType: "number",
        rowNumber: 2,
      })
      expect(errors).toContainEqual({
        type: "cell/type",
        cell: "$40",
        columnName: "price",
        columnType: "number",
        rowNumber: 4,
      })
    })

    it("should validate string to boolean conversion errors", async () => {
      const table = pl
        .DataFrame({
          active: ["true", "yes", "false", "0", "1"],
        })
        .lazy()

      const tableSchema: TableSchema = {
        properties: {
          active: {
            type: "boolean",
          },
        },
      }

      const errors = await inspectTable(table, { tableSchema })

      expect(errors).toHaveLength(1)
      expect(errors).toContainEqual({
        type: "cell/type",
        cell: "yes",
        columnName: "active",
        columnType: "boolean",
        rowNumber: 2,
      })
    })

    it("should validate string to date conversion errors", async () => {
      const table = pl
        .DataFrame({
          created: ["2023-01-15", "Jan 15, 2023", "20230115", "not-a-date"],
        })
        .lazy()

      const tableSchema: TableSchema = {
        properties: {
          created: {
            type: "string",
            format: "date",
          },
        },
      }

      const errors = await inspectTable(table, { tableSchema })

      expect(errors).toHaveLength(3)
      expect(errors).toContainEqual({
        type: "cell/type",
        cell: "Jan 15, 2023",
        columnName: "created",
        columnType: "date",
        rowNumber: 2,
      })
      expect(errors).toContainEqual({
        type: "cell/type",
        cell: "20230115",
        columnName: "created",
        columnType: "date",
        rowNumber: 3,
      })
      expect(errors).toContainEqual({
        type: "cell/type",
        cell: "not-a-date",
        columnName: "created",
        columnType: "date",
        rowNumber: 4,
      })
    })

    it("should validate string to time conversion errors", async () => {
      const table = pl
        .DataFrame({
          time: ["14:30:00", "2:30pm", "invalid", "14h30"],
        })
        .lazy()

      const tableSchema: TableSchema = {
        properties: {
          time: {
            type: "string",
            format: "time",
          },
        },
      }

      const errors = await inspectTable(table, { tableSchema })

      expect(errors).toHaveLength(3)
      expect(errors).toContainEqual({
        type: "cell/type",
        cell: "2:30pm",
        columnName: "time",
        columnType: "time",
        rowNumber: 2,
      })
      expect(errors).toContainEqual({
        type: "cell/type",
        cell: "invalid",
        columnName: "time",
        columnType: "time",
        rowNumber: 3,
      })
      expect(errors).toContainEqual({
        type: "cell/type",
        cell: "14h30",
        columnName: "time",
        columnType: "time",
        rowNumber: 4,
      })
    })

    it("should validate string to datetime conversion errors", async () => {
      const table = pl
        .DataFrame({
          timestamp: [
            "2023-01-15T14:30:00",
            "January 15, 2023 2:30 PM",
            "2023-01-15 14:30",
            "not-a-datetime",
          ],
        })
        .lazy()

      const tableSchema: TableSchema = {
        properties: {
          timestamp: {
            type: "string",
            format: "date-time",
          },
        },
      }

      const errors = await inspectTable(table, { tableSchema })

      expect(errors.length).toBeGreaterThan(0)

      expect(errors).toContainEqual({
        type: "cell/type",
        cell: "January 15, 2023 2:30 PM",
        columnName: "timestamp",
        columnType: "date-time",
        rowNumber: 2,
      })

      expect(errors).toContainEqual({
        type: "cell/type",
        cell: "not-a-datetime",
        columnName: "timestamp",
        columnType: "date-time",
        rowNumber: 4,
      })
    })

    it("should pass validation when all cells are valid", async () => {
      const table = pl
        .DataFrame({
          id: ["1", "2", "3", "4"],
        })
        .lazy()

      const tableSchema: TableSchema = {
        properties: {
          id: {
            type: "integer",
          },
        },
      }

      const errors = await inspectTable(table, { tableSchema })

      expect(errors).toHaveLength(0)
    })

    it("should validate with non-string source data", async () => {
      const table = pl
        .DataFrame({
          is_active: [true, false, true, false],
        })
        .lazy()

      const tableSchema: TableSchema = {
        properties: {
          is_active: {
            type: "boolean",
          },
        },
      }

      const errors = await inspectTable(table, { tableSchema })

      expect(errors).toHaveLength(0)
    })
  })
})
