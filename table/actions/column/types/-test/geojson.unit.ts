import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { inspectTable } from "../../../../actions/table/inspect.ts"

describe("validateGeojsonColumn", () => {
  it("should not errors for valid GeoJSON Point", async () => {
    const table = pl
      .DataFrame({
        location: [
          '{"type":"Point","coordinates":[0,0]}',
          '{"type":"Point","coordinates":[12.5,41.9]}',
          '{"type":"Point","coordinates":[-73.9,40.7]}',
        ],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        location: {
          type: "object",
          format: "geojson",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should not errors for valid GeoJSON geometries", async () => {
    const table = pl
      .DataFrame({
        geometry: [
          '{"type":"LineString","coordinates":[[0,0],[1,1]]}',
          '{"type":"Polygon","coordinates":[[[0,0],[1,0],[1,1],[0,1],[0,0]]]}',
          '{"type":"MultiPoint","coordinates":[[0,0],[1,1]]}',
        ],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        geometry: {
          type: "object",
          format: "geojson",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should not errors for valid GeoJSON Feature", async () => {
    const table = pl
      .DataFrame({
        feature: [
          '{"type":"Feature","geometry":{"type":"Point","coordinates":[0,0]},"properties":{"name":"Test"}}',
          '{"type":"Feature","geometry":{"type":"LineString","coordinates":[[0,0],[1,1]]},"properties":{"id":1}}',
          '{"type":"Feature","geometry":null,"properties":{}}',
        ],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        feature: {
          type: "object",
          format: "geojson",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should not errors for valid GeoJSON FeatureCollection", async () => {
    const table = pl
      .DataFrame({
        collection: [
          '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[0,0]},"properties":{}}]}',
          '{"type":"FeatureCollection","features":[]}',
        ],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        collection: {
          type: "object",
          format: "geojson",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should not errors for null values", async () => {
    const table = pl
      .DataFrame({
        location: [
          '{"type":"Point","coordinates":[0,0]}',
          null,
          '{"type":"Feature","geometry":null,"properties":{}}',
        ],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        location: {
          type: "object",
          format: "geojson",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should errors for JSON arrays", async () => {
    const table = pl
      .DataFrame({
        data: [
          '{"type":"Point","coordinates":[0,0]}',
          "[[0,0],[1,1]]",
          '{"type":"Feature","geometry":null,"properties":{}}',
        ],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        data: {
          type: "object",
          format: "geojson",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([
      {
        type: "cell/type",
        columnName: "data",
        columnType: "geojson",
        rowNumber: 2,
        cell: "[[0,0],[1,1]]",
      },
    ])
  })

  it("should errors for invalid JSON", async () => {
    const table = pl
      .DataFrame({
        data: ['{"type":"Point","coordinates":[0,0]}', "invalid json", "{broken}"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        data: {
          type: "object",
          format: "geojson",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors.filter(e => e.type === "cell/type")).toHaveLength(2)
    expect(errors).toContainEqual({
      type: "cell/type",
      columnName: "data",
      columnType: "geojson",
      rowNumber: 2,
      cell: "invalid json",
    })
    expect(errors).toContainEqual({
      type: "cell/type",
      columnName: "data",
      columnType: "geojson",
      rowNumber: 3,
      cell: "{broken}",
    })
  })

  it("should errors for empty strings", async () => {
    const table = pl
      .DataFrame({
        data: [
          '{"type":"Point","coordinates":[0,0]}',
          "",
          '{"type":"Feature","geometry":null,"properties":{}}',
        ],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        data: {
          type: "object",
          format: "geojson",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([
      {
        type: "cell/type",
        columnName: "data",
        columnType: "geojson",
        rowNumber: 2,
        cell: "",
      },
    ])
  })

  it("should errors for JSON primitives", async () => {
    const table = pl
      .DataFrame({
        data: ['"string"', "123", "true", "false", "null"],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        data: {
          type: "object",
          format: "geojson",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([
      {
        type: "cell/type",
        columnName: "data",
        columnType: "geojson",
        rowNumber: 1,
        cell: '"string"',
      },
      {
        type: "cell/type",
        columnName: "data",
        columnType: "geojson",
        rowNumber: 2,
        cell: "123",
      },
      {
        type: "cell/type",
        columnName: "data",
        columnType: "geojson",
        rowNumber: 3,
        cell: "true",
      },
      {
        type: "cell/type",
        columnName: "data",
        columnType: "geojson",
        rowNumber: 4,
        cell: "false",
      },
      {
        type: "cell/type",
        columnName: "data",
        columnType: "geojson",
        rowNumber: 5,
        cell: "null",
      },
    ])
  })

  it("should errors for invalid GeoJSON Point coordinates", async () => {
    const table = pl
      .DataFrame({
        location: [
          '{"type":"Point","coordinates":[0,0]}',
          '{"type":"Point","coordinates":[0]}',
          '{"type":"Point","coordinates":[0,0,0,0]}',
        ],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        location: {
          type: "object",
          format: "geojson",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(2)
    expect(errors).toContainEqual({
      type: "cell/type",
      columnName: "location",
      columnType: "geojson",
      rowNumber: 2,
      cell: '{"type":"Point","coordinates":[0]}',
    })
    expect(errors).toContainEqual({
      type: "cell/type",
      columnName: "location",
      columnType: "geojson",
      rowNumber: 3,
      cell: '{"type":"Point","coordinates":[0,0,0,0]}',
    })
  })

  it("should errors for invalid GeoJSON LineString", async () => {
    const table = pl
      .DataFrame({
        line: [
          '{"type":"LineString","coordinates":[[0,0],[1,1]]}',
          '{"type":"LineString","coordinates":[[0,0]]}',
          '{"type":"LineString","coordinates":[0,0]}',
        ],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        line: {
          type: "object",
          format: "geojson",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(2)
    expect(errors).toContainEqual({
      type: "cell/type",
      columnName: "line",
      columnType: "geojson",
      rowNumber: 2,
      cell: '{"type":"LineString","coordinates":[[0,0]]}',
    })
    expect(errors).toContainEqual({
      type: "cell/type",
      columnName: "line",
      columnType: "geojson",
      rowNumber: 3,
      cell: '{"type":"LineString","coordinates":[0,0]}',
    })
  })

  it("should errors for incomplete GeoJSON Feature", async () => {
    const table = pl
      .DataFrame({
        feature: [
          '{"type":"Feature","geometry":{"type":"Point","coordinates":[0,0]},"properties":{}}',
          '{"type":"Feature","geometry":{"type":"Point","coordinates":[0,0]}}',
          '{"type":"Feature","properties":{}}',
        ],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        feature: {
          type: "object",
          format: "geojson",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(2)
    expect(errors).toContainEqual({
      type: "cell/type",
      columnName: "feature",
      columnType: "geojson",
      rowNumber: 2,
      cell: '{"type":"Feature","geometry":{"type":"Point","coordinates":[0,0]}}',
    })
    expect(errors).toContainEqual({
      type: "cell/type",
      columnName: "feature",
      columnType: "geojson",
      rowNumber: 3,
      cell: '{"type":"Feature","properties":{}}',
    })
  })

  it("should errors for invalid GeoJSON FeatureCollection", async () => {
    const table = pl
      .DataFrame({
        collection: [
          '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[0,0]},"properties":{}}]}',
          '{"type":"FeatureCollection"}',
        ],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        collection: {
          type: "object",
          format: "geojson",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toEqual([
      {
        type: "cell/type",
        columnName: "collection",
        columnType: "geojson",
        rowNumber: 2,
        cell: '{"type":"FeatureCollection"}',
      },
    ])
  })
})
