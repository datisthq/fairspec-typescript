import type { CellError, Column, ColumnError, TableError } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import type { ColumnMapping } from "../../models/column.ts"
import type { Table } from "../../models/table.ts"
import { NUMBER_COLUMN_NAME } from "../../settings.ts"
import { checkCellConst } from "./checks/const.ts"
import { checkCellEnum } from "./checks/enum.ts"
import { checkCellMaxItems } from "./checks/maxItems.ts"
import { createCheckCellMaximum } from "./checks/maximum.ts"
import { checkCellMaxLength } from "./checks/maxLength.ts"
import { checkCellMinItems } from "./checks/minItems.ts"
import { createCheckCellMinimum } from "./checks/minimum.ts"
import { checkCellMinLength } from "./checks/minLength.ts"
import { checkCellMissing } from "./checks/missing.ts"
import { checkCellMultipleOf } from "./checks/multipleOf.ts"
import { checkCellPattern } from "./checks/pattern.ts"
import { checkCellType } from "./checks/type.ts"
import { normalizeColumn } from "./normalize.ts"
import { inspectArrayColumn } from "./types/array.ts"
import { inspectDurationColumn } from "./types/duration.ts"
import { inspectGeojsonColumn } from "./types/geojson.ts"
import { inspectObjectColumn } from "./types/object.ts"
import { inspectTopojsonColumn } from "./types/topojson.ts"
import { inspectWkbColumn } from "./types/wkb.ts"
import { inspectWktColumn } from "./types/wkt.ts"

export async function inspectColumn(
  mapping: ColumnMapping,
  table: Table,
  options: {
    maxErrors: number
  },
) {
  const { maxErrors } = options
  const errors: TableError[] = []

  const typeErrors = inspectType(mapping)
  errors.push(...typeErrors)

  if (!typeErrors.length) {
    const dataErorrs = await inspectCells(mapping, table, { maxErrors })
    errors.push(...dataErorrs)
  }

  return errors
}

function inspectType(mapping: ColumnMapping) {
  const errors: ColumnError[] = []
  const variant = mapping.source.type.variant

  // TODO: Rebase on proper polars type definition when available
  // https://github.com/pola-rs/nodejs-polars/issues/372
  const compatMapping: Record<string, Column["type"][]> = {
    Bool: ["boolean"],
    Categorical: ["string"],
    Date: ["date"],
    Datetime: ["date-time"],
    Float32: ["number", "integer"],
    Float64: ["number", "integer"],
    Int16: ["integer"],
    Int32: ["integer"],
    Int64: ["integer"],
    Int8: ["integer"],
    List: ["list"],
    String: ["unknown"],
    Time: ["time"],
    UInt16: ["integer"],
    UInt32: ["integer"],
    UInt64: ["integer"],
    UInt8: ["integer"],
    Utf8: ["unknown"],
  }

  const compatTypes = compatMapping[variant] ?? []
  const isCompat = !!new Set(compatTypes).intersection(
    new Set([mapping.target.type, "unknown"]),
  ).size

  if (!isCompat) {
    errors.push({
      type: "column/type",
      columnName: mapping.target.name,
      expectedColumnType: mapping.target.type,
      actualColumnType: compatTypes[0] ?? "unknown",
    })
  }

  return errors
}

async function inspectCells(
  mapping: ColumnMapping,
  table: Table,
  options: {
    maxErrors: number
  },
) {
  // TODO: Improve the implementation
  // Make unblocking / handle large data / process in parallel / move processing to Rust?

  // Types that require non-polars validation
  switch (mapping.target.type) {
    case "duration":
      return await inspectDurationColumn(mapping.target, table)
    case "wkb":
      return await inspectWkbColumn(mapping.target, table)
    case "wkt":
      return await inspectWktColumn(mapping.target, table)
    case "array":
      return await inspectArrayColumn(mapping.target, table)
    case "object":
      return await inspectObjectColumn(mapping.target, table)
    case "geojson":
      return await inspectGeojsonColumn(mapping.target, table)
    case "topojson":
      return await inspectTopojsonColumn(mapping.target, table)
    default:
      return await inspectCellsInPolars(mapping, table, options)
  }
}

async function inspectCellsInPolars(
  mapping: ColumnMapping,
  table: Table,
  options: {
    maxErrors: number
  },
) {
  const { maxErrors } = options
  const errors: CellError[] = []

  // The error column carries a tag, not the error itself: a literal is broadcast to
  // every row, so a JSON template would materialize a full-length string column per
  // check. Templates are resolved back in JS once the frame is filtered down.
  const errorTemplates: CellError[] = []

  let columnCheckTable = table
    .withRowIndex(NUMBER_COLUMN_NAME, 1)
    .select(
      pl.col(NUMBER_COLUMN_NAME),
      normalizeColumn(mapping).alias("target"),
      normalizeColumn(mapping, { keepType: true }).alias("source"),
      pl.lit(null).cast(pl.UInt8).alias("error"),
    )

  for (const checkCell of [
    checkCellType,
    checkCellMissing,
    checkCellEnum,
    checkCellConst,
    createCheckCellMinimum(),
    createCheckCellMaximum(),
    createCheckCellMinimum({ isExclusive: true }),
    createCheckCellMaximum({ isExclusive: true }),
    checkCellMultipleOf,
    checkCellMinLength,
    checkCellMaxLength,
    checkCellMinItems,
    checkCellMaxItems,
    checkCellPattern,
  ]) {
    const cellMapping = { source: pl.col("source"), target: pl.col("target") }

    const check = checkCell(mapping.target, cellMapping)
    if (!check) continue

    const errorTag = errorTemplates.length
    errorTemplates.push(check.errorTemplate)

    columnCheckTable = columnCheckTable.withColumn(
      pl
        .when(pl.col("error").isNotNull())
        .then(pl.col("error"))
        .when(check.isErrorExpr)
        .then(pl.lit(errorTag).cast(pl.UInt8))
        .otherwise(pl.lit(null).cast(pl.UInt8))
        .alias("error"),
    )
  }

  const columnCheckFrame = await columnCheckTable
    .filter(pl.col("error").isNotNull())
    .drop(["target"])
    .head(maxErrors)
    .collect()

  for (const row of columnCheckFrame.toRecords() as any[]) {
    const errorTemplate = errorTemplates[row.error] as CellError
    errors.push({
      ...errorTemplate,
      rowNumber: row[NUMBER_COLUMN_NAME],
      cell: String(row.source ?? ""),
    })
  }

  return errors
}
