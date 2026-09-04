import { MCPServer } from "@mastra/mcp"
import packageJson from "./package.json" with { type: "json" }
import { validateDataTool } from "./tools/data/validate.ts"
import { inferDataSchemaTool } from "./tools/dataSchema/infer.ts"
import { validateDataSchemaTool } from "./tools/dataSchema/validate.ts"
import { inferDatasetTool } from "./tools/dataset/infer.ts"
import { validateDatasetTool } from "./tools/dataset/validate.ts"
import { inferFileDialectTool } from "./tools/fileDialect/infer.ts"
import { queryTableTool } from "./tools/table/query.ts"
import { validateTableTool } from "./tools/table/validate.ts"
import { inferTableSchemaTool } from "./tools/tableSchema/infer.ts"
import { validateTableSchemaTool } from "./tools/tableSchema/validate.ts"

export const server = new MCPServer({
  id: "fairspec",
  name: "fairspec",
  version: packageJson.version,
  tools: {
    inferDataSchemaTool,
    inferDatasetTool,
    inferFileDialectTool,
    inferTableSchemaTool,
    queryTableTool,
    validateDataSchemaTool,
    validateDatasetTool,
    validateDataTool,
    validateTableSchemaTool,
    validateTableTool,
  },
})
