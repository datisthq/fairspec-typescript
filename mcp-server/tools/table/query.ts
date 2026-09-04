import { loadTable, queryTable, Resource } from "@fairspec/library"
import { createTool } from "@mastra/core/tools"
import { z } from "zod"

export const queryTableTool = createTool({
  id: "query-table",
  description:
    "Query a table using SQL. Loads the table, executes the SQL query, and returns the results as an array of records.",
  inputSchema: z.object({
    resource: Resource.describe("The table resource to query"),
    query: z.string().describe("SQL query to execute (use 'self' as table name)"),
  }),
  outputSchema: z.object({
    records: z.array(z.record(z.string(), z.unknown())),
  }),
  execute: async input => {
    const table = await loadTable(input.resource, {})
    if (!table) {
      throw new Error("Could not load table")
    }

    const lazyFrame = queryTable(table, input.query)
    const frame = await lazyFrame.collect()
    const records = frame.toRecords()
    return { records }
  },
})
