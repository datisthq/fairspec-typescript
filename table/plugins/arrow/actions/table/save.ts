import { assertLocalPathVacant } from "@fairspec/dataset"
import { denormalizeTable } from "../../../../actions/table/denormalize.ts"
import { inferTableSchemaFromTable } from "../../../../actions/tableSchema/infer.ts"
import type { SaveTableOptions, Table } from "../../../../models/table.ts"
import { NATIVE_TYPES } from "../../settings.ts"

export async function saveArrowTable(table: Table, options: SaveTableOptions) {
  const { path, overwrite } = options

  if (!overwrite) {
    await assertLocalPathVacant(path)
  }

  const tableSchema =
    options.tableSchema ??
    (await inferTableSchemaFromTable(table, {
      ...options,
      keepStrings: true,
    }))

  table = await denormalizeTable(table, tableSchema, {
    nativeTypes: NATIVE_TYPES,
  })

  await table
    .sinkIpc(path, {
      maintainOrder: true,
    })
    .collect()

  return path
}
