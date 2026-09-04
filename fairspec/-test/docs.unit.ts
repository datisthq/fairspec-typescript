import { readFile, readlink, stat } from "node:fs/promises"
import { join } from "node:path"
import { describe, expect, it } from "vite-plus/test"

const ROOT = join(import.meta.dirname, "..", "..")
const DOCS = ["AGENTS.md", "README.md", "CONTRIBUTING.md"]

const PACKAGES = [
  "agent",
  "dataset",
  "extension",
  "fairspec",
  "library",
  "metadata",
  "table",
  "terminal",
]

const BUILTIN_COMMANDS = ["install", "exec", "add", "remove", "dlx", "why", "publish"]

describe("docs", () => {
  it("names only scripts that exist", async () => {
    const scripts = await readScripts()

    for (const doc of DOCS) {
      const content = readCode(await readDoc(doc))
      const names = [...content.matchAll(/pnpm (?:run )?([\w:-]+)/g)].map(
        match => match[1],
      )

      for (const name of names) {
        if (!name || BUILTIN_COMMANDS.includes(name)) continue
        expect(scripts, `${doc} names "pnpm ${name}"`).toContain(name)
      }
    }
  })

  it("names only paths that exist", async () => {
    for (const doc of DOCS) {
      const content = await readDoc(doc)
      const paths = [...content.matchAll(/`([^`\s]+)`/g)]
        .map(match => match[1])
        .filter(path => path !== undefined)
        .filter(isRepoPath)

      for (const path of paths) {
        expect(await getIsPathExist(path), `${doc} names "${path}"`).toBe(true)
      }
    }
  })

  it("exposes AGENTS.md to Claude Code as a symlink", async () => {
    const target = await readlink(join(ROOT, ".claude", "CLAUDE.md"))
    expect(target).toBe("../AGENTS.md")
  })
})

async function readScripts() {
  const content = await readFile(join(ROOT, "package.json"), "utf-8")
  return Object.keys(JSON.parse(content).scripts)
}

async function readDoc(name: string) {
  return await readFile(join(ROOT, name), "utf-8")
}

function readCode(content: string) {
  const fences = [...content.matchAll(/```[\w]*\n([\s\S]*?)```/g)].map(match => match[1])
  const spans = [...content.matchAll(/`([^`\n]+)`/g)].map(match => match[1])
  return [...fences, ...spans].join("\n")
}

function isRepoPath(value: string) {
  const withoutTrailingSlash = value.replace(/\/$/, "")
  if (!withoutTrailingSlash.includes("/")) return false
  if (withoutTrailingSlash.startsWith(".claude/")) return true
  return PACKAGES.some(name => withoutTrailingSlash.startsWith(`${name}/`))
}

async function getIsPathExist(path: string) {
  try {
    await stat(join(ROOT, path))
    return true
  } catch {
    return false
  }
}
