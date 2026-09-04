import { Report, Resource, validateData } from "@fairspec/library"
import { createTool } from "@mastra/core/tools"
import { z } from "zod"

export const validateDataTool = createTool({
  id: "validate-data",
  description:
    "Validate data against a data schema (JSON Schema). Returns a validation report with errors if any.",
  inputSchema: z.object({
    resource: Resource.describe("The data resource to validate"),
  }),
  outputSchema: z.object({
    report: Report,
  }),
  execute: async input => {
    const report = await validateData(input.resource)
    return { report }
  },
})
