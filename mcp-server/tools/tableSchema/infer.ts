import {
  InferTableSchemaOptions,
  inferTableSchema,
  Resource,
  TableSchema,
} from "@fairspec/library"
import { createTool } from "@mastra/core/tools"
import { z } from "zod"

export const inferTableSchemaTool = createTool({
  id: "infer-table-schema",
  description:
    "Infer a table schema from table resource data. Analyzes the data to determine column types and constraints.",
  inputSchema: z.object({
    resource: Resource.describe("The table resource to infer schema from"),
    options: InferTableSchemaOptions.optional().describe("Schema inference options"),
  }),
  outputSchema: z.object({
    tableSchema: TableSchema.optional(),
  }),
  execute: async input => {
    const tableSchema = await inferTableSchema(input.resource, input.options)
    console.log(tableSchema)
    return { tableSchema }
  },
})
