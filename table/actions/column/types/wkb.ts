import type { WkbColumn } from "@fairspec/metadata"
import { Geometry } from "wkx-ts"
import type { Table } from "../../../models/table.ts"
import { inspectTextColumn } from "../-shared/helpers.ts"

export async function inspectWkbColumn(column: WkbColumn, table: Table) {
  return inspectTextColumn(column, table, {
    // TODO: Fix this hack
    // @ts-expect-error
    parse: source => Geometry._parseWkb(Buffer.from(source, "hex")),
  })
}
