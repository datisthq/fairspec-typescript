import {
  FileDialect,
  InferFileDialectOptions,
  inferFileDialect,
  Resource,
} from "@fairspec/library"
import { createTool } from "@mastra/core/tools"
import { z } from "zod"

export const inferFileDialectTool = createTool({
  id: "infer-file-dialect",
  description:
    "Infer the dialect (format and format-specific properties) from a resource. Analyzes the data to determine CSV delimiters, JSON structure, etc.",
  inputSchema: z.object({
    resource: Resource.describe("The resource to infer dialect from"),
    options: InferFileDialectOptions.optional().describe("Dialect inference options"),
  }),
  outputSchema: z.object({
    fileDialect: FileDialect.optional(),
  }),
  execute: async input => {
    const fileDialect = await inferFileDialect(input.resource, input.options)
    return { fileDialect }
  },
})
