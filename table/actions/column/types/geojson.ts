import type { GeojsonColumn } from "@fairspec/metadata"
import type { Table } from "../../../models/table.ts"
import geojsonJsonSchema from "../../../schemas/geojson.json" with { type: "json" }
import { inspectJsonColumn } from "../-shared/helpers.ts"

export async function inspectGeojsonColumn(column: GeojsonColumn, table: Table) {
  return inspectJsonColumn(column, table, {
    typeJsonSchema: geojsonJsonSchema,
  })
}
