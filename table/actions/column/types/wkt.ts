import type { WktColumn } from "@fairspec/metadata"
import { Geometry } from "wkx-ts"
import type { Table } from "../../../models/table.ts"
import { inspectTextColumn } from "../-shared/helpers.ts"

export async function inspectWktColumn(column: WktColumn, table: Table) {
  return inspectTextColumn(column, table, {
    parse: source => Geometry.parse(source),
  })
}
