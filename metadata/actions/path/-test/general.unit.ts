import { describe, expect, it } from "vite-plus/test"
import {
  getFileExtension,
  getFileName,
  getFileNameSlug,
  getIsRemotePath,
} from "../general.ts"

describe("getIsRemotePath", () => {
  it.each([
    {
      description: "http URL",
      path: "http://example.com/path/to/file.txt",
      isRemote: true,
    },
    {
      description: "https URL",
      path: "https://example.com/path/to/file.txt",
      isRemote: true,
    },
    {
      description: "ftp URL",
      path: "ftp://example.com/path/to/file.txt",
      isRemote: true,
    },
    {
      description: "file URL",
      path: "file:///path/to/file.txt",
      isRemote: false,
    },
    {
      description: "absolute path",
      path: "/path/to/file.txt",
      isRemote: false,
    },
    {
      description: "relative path",
      path: "path/to/file.txt",
      isRemote: false,
    },
    {
      description: "current directory path",
      path: "./file.txt",
      isRemote: false,
    },
    {
      description: "parent directory path",
      path: "../file.txt",
      isRemote: false,
    },
    {
      description: "empty string",
      path: "",
      isRemote: false,
    },
    {
      // new URL considers this to be a valid URL
      description: "protocol without slashes",
      path: "http:example.com",
      isRemote: true,
    },
  ])("$description", ({ path, isRemote }) => {
    expect(getIsRemotePath(path)).toBe(isRemote)
  })
})

describe("getFileName", () => {
  it.each([
    {
      description: "simple filename",
      path: "file.txt",
      filename: "file.txt",
    },
    {
      description: "directory path with filename",
      path: "some/path/to/file.txt",
      filename: "file.txt",
    },
    {
      description: "remote HTTP URL",
      path: "http://example.com/path/to/file.txt",
      filename: "file.txt",
    },
    {
      description: "remote HTTPS URL",
      path: "https://example.com/path/to/file.txt",
      filename: "file.txt",
    },
    {
      description: "URL with query parameters",
      path: "https://example.com/path/to/file.txt?query=param",
      filename: "file.txt",
    },
    {
      description: "URL with hash",
      path: "https://example.com/path/to/file.txt#section",
      filename: "file.txt",
    },
    {
      description: "URL with query and hash",
      path: "https://example.com/path/to/file.txt?query=param#section",
      filename: "file.txt",
    },
    {
      description: "URL with no filename",
      path: "https://example.com/path/",
      filename: undefined,
    },
    {
      description: "local path with no filename",
      path: "some/path/",
      filename: undefined,
    },
  ])("$description", ({ path, filename }) => {
    expect(getFileName(path)).toEqual(filename)
  })
})

describe("getFileExtension", () => {
  it("infers format from single string path", () => {
    expect(getFileExtension("/data/users.csv")).toBe("csv")
  })

  it("infers format from URL path", () => {
    expect(getFileExtension("https://example.com/data/products.json")).toBe("json")
  })

  it("preserve extension case", () => {
    expect(getFileExtension("/data/file.CSV")).toBe("CSV")
  })

  it("returns format name even for unsupported extensions", () => {
    expect(getFileExtension("/data/file.tar.gz")).toBe("gz")
  })

  it("returns undefined when path has no extension", () => {
    expect(getFileExtension("/data/file")).toBeUndefined()
  })

  it("returns undefined when filename cannot be determined", () => {
    expect(getFileExtension("/data/folder/")).toBeUndefined()
  })

  it("handles multiple extensions", () => {
    expect(getFileExtension("/data/file.backup.csv")).toBe("csv")
  })

  it("handles hidden files with extension", () => {
    expect(getFileExtension("/data/.gitignore")).toBeUndefined()
  })

  it("handles URL with query parameters", () => {
    expect(getFileExtension("https://example.com/file.json?key=value")).toBe("json")
  })

  it("handles URL with hash", () => {
    expect(getFileExtension("https://example.com/file.pdf#page=1")).toBe("pdf")
  })
})

describe("getFileNameSlug", () => {
  it("returns slugified basename from single string path", () => {
    expect(getFileNameSlug("/data/users.csv")).toBe("users")
  })

  it("returns slugified basename from URL path", () => {
    expect(getFileNameSlug("https://example.com/data/products.json")).toBe("products")
  })

  it("returns undefined when path has no filename", () => {
    expect(getFileNameSlug("/data/folder/")).toBeUndefined()
  })

  it("handles complex filename with multiple dots", () => {
    expect(getFileNameSlug("/data/file.backup.csv")).toBe("file_backup")
  })

  it("slugifies filename with spaces and special characters", () => {
    expect(getFileNameSlug("/data/My Data File!.csv")).toBe("my_data_file")
  })

  it("returns undefined for empty string", () => {
    expect(getFileNameSlug("")).toBeUndefined()
  })

  it("handles simple filename without directory", () => {
    expect(getFileNameSlug("document.txt")).toBe("document")
  })

  it("handles URL with query parameters", () => {
    expect(getFileNameSlug("https://example.com/file.json?key=value")).toBe("file")
  })

  it("handles URL with hash", () => {
    expect(getFileNameSlug("https://example.com/report.pdf#page=1")).toBe("report")
  })

  it("handles hidden files", () => {
    expect(getFileNameSlug("/data/.gitignore")).toBe("gitignore")
  })

  it("slugifies uppercase letters to lowercase", () => {
    expect(getFileNameSlug("/data/MyDocument.PDF")).toBe("my_document")
  })

  it("replaces hyphens with underscores", () => {
    expect(getFileNameSlug("/data/my-file-name.csv")).toBe("my_file_name")
  })
})
