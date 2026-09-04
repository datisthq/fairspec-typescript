import { Descriptor, Report, validateDataSchema } from "@fairspec/library"
import { createTool } from "@mastra/core/tools"
import { z } from "zod"

export const validateDataSchemaTool = createTool({
  id: "validate-data-schema",
  description:
    "Validate a data schema (JSON Schema) against the Fairspec Data Schema specification. Returns validation report with errors if any.",
  inputSchema: z.object({
    source: z
      .union([Descriptor, z.string()])
      .describe("The data schema to validate (descriptor object or file path)"),
  }),
  outputSchema: z.object({
    report: Report,
  }),
  execute: async input => {
    const report = await validateDataSchema(input.source)
    return { report }
  },
})
