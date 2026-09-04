import { Descriptor, Report, validateTableSchema } from "@fairspec/library"
import { createTool } from "@mastra/core/tools"
import { z } from "zod"

export const validateTableSchemaTool = createTool({
  id: "validate-table-schema",
  description:
    "Validate a table schema against the Fairspec Table Schema specification. Returns validation report with errors if any.",
  inputSchema: z.object({
    source: z
      .union([Descriptor, z.string()])
      .describe("The table schema to validate (descriptor object or file path)"),
  }),
  outputSchema: z.object({
    report: Report,
  }),
  execute: async input => {
    const report = await validateTableSchema(input.source)
    return { report }
  },
})
