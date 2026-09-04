import type { ObjectColumn } from "@fairspec/metadata"
import type { Table } from "../../../models/table.ts"
import { inspectJsonColumn } from "../-shared/helpers.ts"

export async function inspectObjectColumn(column: ObjectColumn, table: Table) {
  return inspectJsonColumn(column, table)
}
