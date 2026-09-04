import { Report, Resource, ValidateTableOptions, validateTable } from "@fairspec/library"
import { createTool } from "@mastra/core/tools"
import { z } from "zod"

export const validateTableTool = createTool({
  id: "validate-table",
  description:
    "Validate a table resource against its schema. Returns a validation report with errors if any.",
  inputSchema: z.object({
    resource: Resource.describe("The table resource to validate"),
    options: ValidateTableOptions.optional().describe("Validation options"),
  }),
  outputSchema: z.object({
    report: Report,
  }),
  execute: async input => {
    const report = await validateTable(input.resource, input.options)
    return { report }
  },
})
