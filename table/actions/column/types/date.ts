import type { DateColumn } from "@fairspec/metadata"
import * as pl from "nodejs-polars"

const DEFAULT_FORMAT = "%Y-%m-%d"

export function parseDateColumn(column: DateColumn, columnExpr: pl.Expr) {
  const format = column.property.temporalFormat ?? DEFAULT_FORMAT

  return columnExpr.str.strptime(pl.Date, format)
}

export function stringifyDateColumn(column: DateColumn, columnExpr: pl.Expr) {
  const format = column.property.temporalFormat ?? DEFAULT_FORMAT

  return columnExpr.dt.strftime(format)
}
