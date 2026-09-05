import { defineConfig } from "livemark"

export default defineConfig({
  site: "https://typescript.fairspec.org",
  title: "Fairspec TypeScript",
  description: "Data management framework",
  logo: "/logo.svg",
  favicon: "/logo.png",
  include: ["README.md", "project/docs/**/*.md", "CONTRIBUTING.md"],
  sections: [
    {
      type: "custom",
      title: "Fairspec",
      url: "https://fairspec.org",
      icon: "house",
    },
    {
      type: "custom",
      title: "Standard",
      url: "https://fairspec.org/overview/",
      icon: "book-open",
    },
    {
      type: "custom",
      title: "Python",
      url: "https://python.fairspec.org",
      icon: "code",
    },
    { title: "TypeScript", prefix: "/", icon: "code-xml" },
    {
      type: "custom",
      title: "MCP Server",
      url: "/mcp-server/",
      icon: "sparkles",
      siteTitle: "Fairspec MCP Server",
      siteDescription: "AI-assisted data management",
      siteLink: "/mcp-server/",
    },
    {
      type: "custom",
      title: "Application",
      url: "https://application.fairspec.org",
      icon: "app-window",
    },
    {
      title: "Changelog",
      prefix: "/changelog/",
      type: "changelog",
      source: "https://github.com/datisthq/fairspec-typescript",
      version: true,
      icon: "history",
    },
    {
      type: "custom",
      title: "GitHub",
      url: "https://github.com/datisthq/fairspec-typescript",
      icon: "github",
    },
  ],
  patches: [
    {
      file: "README.md",
      article: {
        title: "Fairspec TypeScript",
        label: "Getting Started",
        description: "Data management framework",
        icon: "rocket",
        path: "/",
        order: 0,
      },
    },
    {
      file: "CONTRIBUTING.md",
      article: {
        title: "Contributing",
        description: "How to set up the repository, propose changes, and ship a release.",
        icon: "heart-handshake",
        path: "/contributing/",
        order: -1,
      },
    },
  ],
})
