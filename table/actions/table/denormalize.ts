import type { TableSchema } from "@fairspec/metadata"
import { getColumns } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { denormalizeColumn } from "../../actions/column/denormalize.ts"
import { getPolarsSchema } from "../../helpers/schema.ts"
import type { DenormalizeColumnOptions } from "../../models/column.ts"
import type { SchemaMapping } from "../../models/schema.ts"
import type { Table } from "../../models/table.ts"
import { mergeMissingValues } from "./-shared/helpers.ts"

const HEAD_ROWS = 100

export async function denormalizeTable(
  table: Table,
  tableSchema: TableSchema,
  options?: DenormalizeColumnOptions,
) {
  const head = await table.head(HEAD_ROWS).collect()
  const polarsSchema = getPolarsSchema(head.schema)

  const mapping = { source: polarsSchema, target: tableSchema }
  return table.select(...Object.values(denormalizeColumns(mapping, options)))
}

export function denormalizeColumns(
  mapping: SchemaMapping,
  options?: DenormalizeColumnOptions,
) {
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
      expr = denormalizeColumn(columnMapping, options)
    }

    exprs[column.name] = expr
  }

  return exprs
}
