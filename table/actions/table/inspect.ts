import type { Column, RowError, TableError, TableSchema } from "@fairspec/metadata"
import { getColumns } from "@fairspec/metadata"
import * as pl from "nodejs-polars"
import pAll from "p-all"
import { inspectColumn } from "../../actions/column/inspect.ts"
import { getPolarsSchema } from "../../helpers/schema.ts"
import type { SchemaMapping } from "../../models/schema.ts"
import type { Table } from "../../models/table.ts"
import {
  ERROR_COLUMN_NAME,
  INSPECT_COLUMN_CONCURRENCY,
  INSPECT_ROW_CONCURRENCY,
  NUMBER_COLUMN_NAME,
} from "../../settings.ts"
import { createRowKeyChecks } from "./checks/key.ts"

export async function inspectTable(
  table: Table,
  options?: {
    tableSchema?: TableSchema
    sampleRows?: number
    maxErrors?: number
  },
) {
  const { tableSchema, sampleRows = 100, maxErrors = 1000 } = options ?? {}
  const errors: TableError[] = []

  if (tableSchema) {
    const sample = await table.head(sampleRows).collect()
    const polarsSchema = getPolarsSchema(sample.schema)
    const mapping = { source: polarsSchema, target: tableSchema }

    const columnErrors = await inspectColumns(mapping, table, { maxErrors })
    errors.push(...columnErrors)

    const rowErrors = await inspectRows(mapping, table, { maxErrors })
    errors.push(...rowErrors)
  }

  return errors.slice(0, maxErrors)
}

async function inspectColumns(
  mapping: SchemaMapping,
  table: Table,
  options: {
    maxErrors: number
  },
) {
  const { maxErrors } = options
  const errors: TableError[] = []
  const columns = getColumns(mapping.target)
  const abortController = new AbortController()
  const maxColumnErrors = Math.ceil(maxErrors / columns.length)

  const collectColumnErrors = async (column: Column) => {
    const polarsColumn = mapping.source.columns.find(
      polarsColumn => polarsColumn.name === column.name,
    )

    if (!polarsColumn) {
      errors.push({
        type: "column/missing",
        columnName: column.name,
      })
      return
    }

    const columnMapping = { source: polarsColumn, target: column }
    const fieldErrors = await inspectColumn(columnMapping, table, {
      maxErrors: maxColumnErrors,
    })

    errors.push(...fieldErrors)
    if (errors.length > maxErrors) {
      abortController.abort()
    }
  }

  try {
    await pAll(
      columns.map(column => () => collectColumnErrors(column)),
      { concurrency: INSPECT_COLUMN_CONCURRENCY },
    )
  } catch (error) {
    const isAborted = error instanceof Error && error.name === "AbortError"
    if (!isAborted) throw error
  }

  return errors
}

async function inspectRows(
  mapping: SchemaMapping,
  table: Table,
  options: { maxErrors: number },
) {
  const { maxErrors } = options
  const errors: TableError[] = []
  const columns = getColumns(mapping.target)
  const abortController = new AbortController()
  const maxRowErrors = Math.ceil(maxErrors / columns.length)

  const collectRowErrors = async (check: any) => {
    // A literal is broadcast to every row, so flag the error with a boolean rather
    // than a JSON template, which would materialize a full-length string column.
    // The check owns a single template, so it is read from the closure below.
    const rowCheckTable = table
      .withRowIndex(NUMBER_COLUMN_NAME, 1)
      .withColumn(
        pl
          .when(check.isErrorExpr)
          .then(pl.lit(true))
          .otherwise(pl.lit(null).cast(pl.Bool))
          .alias(ERROR_COLUMN_NAME),
      )

    const rowCheckFrame = await rowCheckTable
      .filter(pl.col(ERROR_COLUMN_NAME).isNotNull())
      .head(maxRowErrors)
      .collect()

    const errorTemplate = check.errorTemplate as RowError
    for (const row of rowCheckFrame.toRecords() as any[]) {
      errors.push({
        ...errorTemplate,
        rowNumber: row[NUMBER_COLUMN_NAME],
      })
    }

    if (errors.length > maxErrors) {
      abortController.abort()
    }
  }

  try {
    await pAll(
      [...createRowKeyChecks(mapping)].map(it => () => collectRowErrors(it)),
      { concurrency: INSPECT_ROW_CONCURRENCY },
    )
  } catch (error) {
    const isAborted = error instanceof Error && error.name === "AbortError"
    if (!isAborted) throw error
  }

  return errors
}
