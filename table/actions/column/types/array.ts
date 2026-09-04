import type { ArrayColumn } from "@fairspec/metadata"
import type { Table } from "../../../models/table.ts"
import { inspectJsonColumn } from "../-shared/helpers.ts"

export async function inspectArrayColumn(column: ArrayColumn, table: Table) {
  return inspectJsonColumn(column, table)
}
