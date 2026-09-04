import type { DurationColumn } from "@fairspec/metadata"
import { Temporal } from "temporal-polyfill"
import type { Table } from "../../../models/table.ts"
import { inspectTextColumn } from "../-shared/helpers.ts"

export async function inspectDurationColumn(column: DurationColumn, table: Table) {
  return inspectTextColumn(column, table, {
    // TODO: Fix this hack
    parse: source => Temporal.Duration.from(source),
  })
}
