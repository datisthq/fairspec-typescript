import type {
  ArrayColumn,
  CellError,
  DurationColumn,
  GeojsonColumn,
  ObjectColumn,
  TopojsonColumn,
  WkbColumn,
  WktColumn,
} from "@fairspec/metadata"
import { inspectJson } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import { getIsObject } from "../../../helpers/general.ts"
import type { Table } from "../../../models/table.ts"
import { NUMBER_COLUMN_NAME } from "../../../settings.ts"

// TODO: Generalize wkt/wkb/duration inspectors

export async function inspectTextColumn(
  column: DurationColumn | WktColumn | WkbColumn,
  table: Table,
  options: {
    parse: (source: string) => unknown | undefined
  },
) {
  const errors: CellError[] = []

  const frame = await table
    .withRowIndex(NUMBER_COLUMN_NAME, 1)
    .select(pl.col(NUMBER_COLUMN_NAME), pl.col(column.name).alias("source"))
    .collect()

  for (const row of frame.toRecords() as any[]) {
    if (row.source === null) continue

    let target: unknown | undefined
    try {
      target = options.parse(row.source)
    } catch {}

    if (!target) {
      errors.push({
        type: "cell/type",
        cell: String(row.source),
        columnName: column.name,
        columnType: column.type,
        rowNumber: row[NUMBER_COLUMN_NAME],
      })
    }
  }

  return errors
}

export async function inspectJsonColumn(
  column: ArrayColumn | ObjectColumn | GeojsonColumn | TopojsonColumn,
  table: Table,
  options?: {
    typeJsonSchema?: Record<string, any>
  },
) {
  const errors: CellError[] = []

  const typeJsonSchema = options?.typeJsonSchema
  const constraintJsonSchema = column.property

  const frame = await table
    .withRowIndex(NUMBER_COLUMN_NAME, 1)
    .select(pl.col(NUMBER_COLUMN_NAME), pl.col(column.name).alias("source"))
    .collect()

  for (const row of frame.toRecords() as any[]) {
    if (row.source === null) continue

    let target: Record<string, any> | undefined
    const checkCompat = column.type === "array" ? Array.isArray : getIsObject

    try {
      target = JSON.parse(row.source)
    } catch {}

    if (!target || !checkCompat(target)) {
      errors.push({
        type: "cell/type",
        cell: String(row.source),
        columnName: column.name,
        columnType: column.type,
        rowNumber: row[NUMBER_COLUMN_NAME],
      })

      continue
    }

    if (typeJsonSchema) {
      const formatErrors = await inspectJson(target, {
        jsonSchema: typeJsonSchema,
      })

      if (formatErrors.length) {
        errors.push({
          type: "cell/type",
          cell: String(row.source),
          columnName: column.name,
          columnType: column.type,
          rowNumber: row[NUMBER_COLUMN_NAME],
        })
      }

      continue
    }

    if (constraintJsonSchema) {
      const constraintErrors = await inspectJson(target, {
        jsonSchema: constraintJsonSchema,
      })

      for (const error of constraintErrors) {
        errors.push({
          type: "cell/json",
          cell: String(row.source),
          columnName: column.name,
          rowNumber: row[NUMBER_COLUMN_NAME],
          message: error.message,
          jsonPointer: error.jsonPointer,
        })
      }
    }
  }

  return errors
}
