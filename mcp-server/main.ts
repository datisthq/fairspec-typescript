import { server } from "./server.ts"

server.startStdio().catch(error => {
  console.error("Error running MCP server:", error)
  process.exit(1)
})
