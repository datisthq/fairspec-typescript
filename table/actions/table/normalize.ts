import type { TableSchema } from "@fairspec/metadata"
import { getColumns } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { normalizeColumn } from "../../actions/column/normalize.ts"
import { getPolarsSchema } from "../../helpers/schema.ts"
import type { SchemaMapping } from "../../models/schema.ts"
import type { Table } from "../../models/table.ts"
import { mergeMissingValues } from "./-shared/helpers.ts"

const HEAD_ROWS = 100

export async function normalizeTable(table: Table, tableSchema: TableSchema) {
  const head = await table.head(HEAD_ROWS).collect()
  const polarsSchema = getPolarsSchema(head.schema)

  const mapping = { source: polarsSchema, target: tableSchema }
  return table.select(...Object.values(normalizeColumns(mapping)))
}

export function normalizeColumns(mapping: SchemaMapping) {
  const exprs: Record<string, pl.Expr> = {}
  const columns = getColumns(mapping.target)

  for (const column of columns) {
    let expr = pl.lit(null).alias(column.name)

    const polarsColumn = mapping.source.columns.find(
      polarsColumn => polarsColumn.name === column.name,
    )

    if (polarsColumn) {
      const mergedColumn = mergeMissingValues(column, mapping.target)
      const columnMapping = { source: polarsColumn, target: mergedColumn }
      expr = normalizeColumn(columnMapping)
    }

    exprs[column.name] = expr
  }

  return exprs
}
