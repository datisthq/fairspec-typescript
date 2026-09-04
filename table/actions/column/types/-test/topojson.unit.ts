import type { TableSchema } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { describe, expect, it } from "vite-plus/test"
import { inspectTable } from "../../../../actions/table/inspect.ts"

describe("validateTopojsonColumn", () => {
  it("should not errors for valid TopoJSON", async () => {
    const table = pl
      .DataFrame({
        topology: [
          '{"type":"Topology","objects":{"example":{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[0,0]}]}},"arcs":[]}',
          '{"type":"Topology","objects":{"collection":{"type":"GeometryCollection","geometries":[]}},"arcs":[]}',
        ],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        topology: {
          type: "object",
          format: "topojson",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should errors for invalid TopoJSON structure", async () => {
    const table = pl
      .DataFrame({
        topology: [
          '{"type":"Topology","objects":{"example":{"type":"GeometryCollection","geometries":[]}},"arcs":[]}',
          '{"type":"Topology","objects":{}}',
          '{"type":"Topology"}',
        ],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        topology: {
          type: "object",
          format: "topojson",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(2)
    expect(errors).toContainEqual({
      type: "cell/type",
      columnName: "topology",
      columnType: "topojson",
      rowNumber: 2,
      cell: '{"type":"Topology","objects":{}}',
    })
    expect(errors).toContainEqual({
      type: "cell/type",
      columnName: "topology",
      columnType: "topojson",
      rowNumber: 3,
      cell: '{"type":"Topology"}',
    })
  })

  it("should accept TopoJSON geometry objects", async () => {
    const table = pl
      .DataFrame({
        geometry: [
          '{"type":"Point","coordinates":[0,0]}',
          '{"type":"LineString","arcs":[0,1]}',
          '{"type":"Polygon","arcs":[[0,1,2]]}',
        ],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        geometry: {
          type: "object",
          format: "topojson",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })

  it("should handle null values for topojson format", async () => {
    const table = pl
      .DataFrame({
        topology: [
          '{"type":"Topology","objects":{"example":{"type":"GeometryCollection","geometries":[]}},"arcs":[]}',
          null,
        ],
      })
      .lazy()

    const tableSchema: TableSchema = {
      properties: {
        topology: {
          type: "object",
          format: "topojson",
        },
      },
    }

    const errors = await inspectTable(table, { tableSchema })
    expect(errors).toHaveLength(0)
  })
})
