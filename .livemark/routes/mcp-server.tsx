import { createFileRoute } from "@tanstack/react-router"
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  ListOrdered,
  Search,
  Sparkles,
  Wrench,
} from "lucide-react"
import type { ComponentType, ReactNode, SVGProps } from "react"
import { useState } from "react"
import { buttonVariants } from "livemark/elements/button"
import { useInView } from "livemark/hooks/in-view"
import { cn } from "livemark/utils/style"

// @ts-ignore
export const Route = createFileRoute("/mcp-server/")({
  component: McpServerPage,
  head: () => ({
    meta: [
      { title: "Fairspec MCP Server" },
      {
        name: "description",
        content: "AI assistant integration for the Fairspec data management framework.",
      },
    ],
  }),
})

function McpServerPage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Installation />
      <Usage />
      <Tools />
    </div>
  )
}

/* ─────────────────────────── Hero ─────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border flex items-center min-h-[calc(100vh-4rem)]">
      <BackgroundGrid />
      <div className="relative w-full mx-auto max-w-7xl px-6 py-16 md:py-24 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 ease-out">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-6">
              <Sparkles className="size-3.5 text-primary" />
              Technical preview
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
              Fairspec MCP Server
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground">
              Connect AI assistants to the{" "}
              <strong className="text-foreground">Fairspec</strong> data management
              framework. Validate datasets, infer schemas, and query tables — directly
              from your editor or chat.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <a
                href="#installation"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "px-5 no-underline",
                )}
              >
                Install
                <ArrowRight className="size-4" />
              </a>
              <a
                href="https://github.com/datisthq/fairspec"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "px-5 no-underline",
                )}
              >
                View on GitHub
                <ExternalLink className="size-4" />
              </a>
            </div>
          </div>
          <Transcript />
        </div>
      </div>
    </section>
  )
}

function Transcript() {
  return (
    <div className="rounded-xl border border-primary/20 bg-card overflow-hidden text-left">
      <div className="flex items-center gap-2 border-b border-primary/20 px-4 py-2 bg-muted/50">
        <div className="size-2.5 rounded-full bg-red-400/60" />
        <div className="size-2.5 rounded-full bg-yellow-400/60" />
        <div className="size-2.5 rounded-full bg-green-400/60" />
        <span className="ml-2 text-xs font-mono text-muted-foreground">AI Assistant</span>
      </div>
      <div className="p-5 space-y-4 font-mono text-sm leading-relaxed overflow-x-auto">
        <div className="flex items-start gap-2">
          <ChevronRight className="size-4 mt-0.5 text-primary shrink-0" />
          <span className="text-foreground">Infer the schema for members.csv</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/60 px-2 py-1 text-muted-foreground">
            <Wrench className="size-3 text-primary" />
            inferTableSchemaTool
          </span>
        </div>
        <pre className="rounded-md border border-border bg-background p-4 overflow-x-auto">
          <TableSchemaSample />
        </pre>
      </div>
    </div>
  )
}

function TableSchemaSample() {
  return (
    <code className={tk.body}>
      <span className={tk.punct}>{"{"}</span>
      {"\n  "}
      <span className={tk.key}>"id"</span>
      <span className={tk.punct}>:</span> <span className={tk.punct}>{"{ "}</span>
      <span className={tk.key}>"type"</span>
      <span className={tk.punct}>:</span> <span className={tk.str}>"integer"</span>
      <span className={tk.punct}>{" }"}</span>
      <span className={tk.punct}>,</span>
      {"\n  "}
      <span className={tk.key}>"name"</span>
      <span className={tk.punct}>:</span> <span className={tk.punct}>{"{ "}</span>
      <span className={tk.key}>"type"</span>
      <span className={tk.punct}>:</span> <span className={tk.str}>"string"</span>
      <span className={tk.punct}>{" }"}</span>
      <span className={tk.punct}>,</span>
      {"\n  "}
      <span className={tk.key}>"joined"</span>
      <span className={tk.punct}>:</span> <span className={tk.punct}>{"{ "}</span>
      <span className={tk.key}>"type"</span>
      <span className={tk.punct}>:</span> <span className={tk.str}>"string"</span>
      <span className={tk.punct}>,</span> <span className={tk.key}>"format"</span>
      <span className={tk.punct}>:</span> <span className={tk.str}>"date"</span>
      <span className={tk.punct}>{" }"}</span>
      <span className={tk.punct}>,</span>
      {"\n  "}
      <span className={tk.key}>"score"</span>
      <span className={tk.punct}>:</span> <span className={tk.punct}>{"{ "}</span>
      <span className={tk.key}>"type"</span>
      <span className={tk.punct}>:</span> <span className={tk.str}>"number"</span>
      <span className={tk.punct}>{" }"}</span>
      {"\n"}
      <span className={tk.punct}>{"}"}</span>
    </code>
  )
}

function BackgroundGrid() {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 [background-image:repeating-linear-gradient(90deg,var(--color-border)_0,var(--color-border)_1px,transparent_1px,transparent_8px)] opacity-25 [mask-image:linear-gradient(to_top,black_10%,transparent_85%)]"
      />
      <div
        aria-hidden
        className="absolute -bottom-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-blue-400/30 dark:bg-blue-500/25 blur-[110px] pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -top-32 -right-32 h-[32rem] w-[32rem] rounded-full bg-sky-400/25 dark:bg-sky-500/20 blur-[110px] pointer-events-none"
      />
    </>
  )
}

/* ─────────────────────────── Installation ─────────────────────────── */

const tk = {
  punct: "text-[#7c7f93] dark:text-[#9399b2]",
  key: "text-[#1e66f5] dark:text-[#89b4fa]",
  str: "text-[#40a02b] dark:text-[#a6e3a1]",
  cmd: "text-[#8839ef] dark:text-[#cba6f7]",
  body: "text-[#4c4f69] dark:text-[#cdd6f4]",
}

function BashAgentAdd({ agent }: { agent: "claude" | "codex" }) {
  return (
    <code className={tk.body}>
      <span className={tk.cmd}>{agent}</span> mcp add{" "}
      <span className={tk.str}>fairspec</span> <span className={tk.punct}>--</span> npx{" "}
      <span className={tk.str}>fairspec@latest</span> mcp
    </code>
  )
}

function McpServersJson({ rootKey }: { rootKey: "mcpServers" | "servers" }) {
  return (
    <code className={tk.body}>
      <span className={tk.punct}>{"{"}</span>
      {"\n  "}
      <span className={tk.key}>"{rootKey}"</span>
      <span className={tk.punct}>:</span> <span className={tk.punct}>{"{"}</span>
      {"\n    "}
      <span className={tk.key}>"fairspec"</span>
      <span className={tk.punct}>:</span> <span className={tk.punct}>{"{"}</span>
      {"\n      "}
      <span className={tk.key}>"command"</span>
      <span className={tk.punct}>:</span> <span className={tk.str}>"npx"</span>
      <span className={tk.punct}>,</span>
      {"\n      "}
      <span className={tk.key}>"args"</span>
      <span className={tk.punct}>:</span> <span className={tk.punct}>[</span>
      <span className={tk.str}>"fairspec@latest"</span>
      <span className={tk.punct}>,</span> <span className={tk.str}>"mcp"</span>
      <span className={tk.punct}>]</span>
      {"\n    "}
      <span className={tk.punct}>{"}"}</span>
      {"\n  "}
      <span className={tk.punct}>{"}"}</span>
      {"\n"}
      <span className={tk.punct}>{"}"}</span>
    </code>
  )
}

interface Assistant {
  name: string
  description: ReactNode
  snippet: ReactNode
}

const assistants: Assistant[] = [
  {
    name: "Claude Desktop",
    description: (
      <>
        Add to your <code>claude_desktop_config.json</code>:
      </>
    ),
    snippet: <McpServersJson rootKey="mcpServers" />,
  },
  {
    name: "Claude Code",
    description: <>Add the server with one command in any project directory.</>,
    snippet: <BashAgentAdd agent="claude" />,
  },
  {
    name: "Codex",
    description: (
      <>
        One command configures the Codex CLI, the ChatGPT desktop app, and the IDE
        extension — they share the same MCP configuration.
      </>
    ),
    snippet: <BashAgentAdd agent="codex" />,
  },
  {
    name: "Gemini CLI",
    description: (
      <>
        Add to <code>~/.gemini/settings.json</code>:
      </>
    ),
    snippet: <McpServersJson rootKey="mcpServers" />,
  },
]

function Installation() {
  const [active, setActive] = useState(0)
  const assistant = assistants[active] ?? assistants[0]
  if (!assistant) return null
  return (
    <section id="installation" className="border-b border-border scroll-mt-16">
      <div className="mx-auto max-w-5xl px-6 py-24">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Installation
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Wire up the Fairspec MCP server in your favorite AI assistant.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div
              role="tablist"
              className="flex flex-wrap border-b border-border bg-muted/40"
            >
              {assistants.map((a, i) => (
                <button
                  key={a.name}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  onClick={() => setActive(i)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium transition-colors border-b-2",
                    i === active
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {a.name}
                </button>
              ))}
            </div>
            <div className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                {assistant.description}
              </p>
              <pre className="rounded-md border border-border bg-background p-4 text-sm leading-relaxed font-mono overflow-x-auto">
                {assistant.snippet}
              </pre>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ─────────────────────────── Usage ─────────────────────────── */

const prompts: string[] = [
  "Validate my dataset in the current directory",
  "Infer the schema for data.csv",
  "Check if my data schema is valid",
  "Detect the dialect of measurements.tsv",
  "Query users.csv for all records where age > 30",
  "Infer a dataset descriptor from all files in the data folder",
  "Validate the table schema in schema.json",
  "Show me the first 10 rows of results.csv sorted by date",
]

function Usage() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Usage</h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Just ask in natural language. Try one of these prompts.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
          {prompts.map((p, i) => (
            <Reveal key={p} delayMs={i * 40}>
              <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
                <Sparkles className="size-4 mt-0.5 text-primary shrink-0" />
                <p className="text-sm text-foreground leading-relaxed">{p}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── Tools ─────────────────────────── */

interface Tool {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  description: string
}

const tools: Tool[] = [
  {
    icon: CheckCircle2,
    title: "Validate Data",
    description:
      "Validates data against a provided data schema, checking that every value conforms to the declared types and constraints. Returns detailed error reports pinpointing exactly which values failed validation and why.",
  },
  {
    icon: Search,
    title: "Infer Data Schema",
    description:
      "Analyzes a data sample and infers a data schema descriptor describing its structure, types, and constraints. Examines patterns across values to determine the most appropriate type for each field.",
  },
  {
    icon: CheckCircle2,
    title: "Validate Data Schema",
    description:
      "Checks that a data schema descriptor is well-formed and conforms to the Fairspec specification. Ensures that all field definitions use valid types and that constraints are properly structured.",
  },
  {
    icon: Search,
    title: "Infer Dataset",
    description:
      "Scans a directory of files and produces a dataset descriptor capturing the structure, resources, and metadata. Automatically discovers tabular files, infers their schemas and dialects.",
  },
  {
    icon: CheckCircle2,
    title: "Validate Dataset",
    description:
      "Checks that a dataset descriptor is well-formed and that all referenced resources are consistent. Verifies that resource paths resolve correctly and that schemas match the actual data.",
  },
  {
    icon: Search,
    title: "Infer File Dialect",
    description:
      "Detects the dialect of a tabular file, including delimiter, quote character, and header row presence. Samples the file content to reliably determine formatting details such as line terminators and encoding.",
  },
  {
    icon: ListOrdered,
    title: "Query Table",
    description:
      "Runs a SQL query against a tabular data file and returns the matching rows. Supports standard SQL syntax for filtering, sorting, aggregating, and joining data.",
  },
  {
    icon: CheckCircle2,
    title: "Validate Table",
    description:
      "Checks that a table descriptor is well-formed and that the referenced data matches the declared schema. Reports mismatches between expected and observed field types, missing values, and constraint violations.",
  },
  {
    icon: Search,
    title: "Infer Table Schema",
    description:
      "Reads a tabular data file and infers a table schema descriptor with field names, types, and constraints. Analyzes column values to determine appropriate data types and identifies common patterns.",
  },
  {
    icon: CheckCircle2,
    title: "Validate Table Schema",
    description:
      "Checks that a table schema descriptor is well-formed and conforms to the Fairspec specification. Ensures that all field definitions, types, and constraints are valid and properly structured.",
  },
]

function Tools() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Tools</h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Ten tools organized around core Fairspec concepts: data, data schemas,
              datasets, file dialects, tables, and table schemas.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((t, i) => (
            <Reveal key={t.title} delayMs={i * 40}>
              <ToolCard {...t} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function ToolCard({ icon: Icon, title, description }: Tool) {
  return (
    <div className="block h-full relative rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="inline-flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

/* ─────────────────────────── Reveal helper ─────────────────────────── */

function Reveal(props: { children: ReactNode; delayMs?: number }) {
  const { ref, isVisible } = useInView()
  return (
    <div
      ref={ref as (node: HTMLDivElement | null) => void}
      style={{ transitionDelay: `${props.delayMs ?? 0}ms` }}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
    >
      {props.children}
    </div>
  )
}
