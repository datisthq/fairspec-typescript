import { Dataset, Report, validateDataset } from "@fairspec/library"
import { createTool } from "@mastra/core/tools"
import { z } from "zod"

export const validateDatasetTool = createTool({
  id: "validate-dataset",
  description:
    "Validate a dataset including all its resources and foreign keys. Returns a validation report with errors if any.",
  inputSchema: z.object({
    source: z
      .union([Dataset, z.string()])
      .describe("The dataset to validate (dataset object or file path)"),
  }),
  outputSchema: z.object({
    report: Report,
  }),
  execute: async input => {
    const report = await validateDataset(input.source)
    return { report }
  },
})
