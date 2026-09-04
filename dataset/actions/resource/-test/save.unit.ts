import { describe, expect, it } from "vite-plus/test"
import { saveResourceFiles } from "../save.ts"

describe("saveResourceFiles", () => {
  it.each([
    {
      description: "local path",
      basepath: "data",
      resource: {
        data: "data/table.csv",
        dataSchema: "data/data-schema.json",
        tableSchema: "data/table-schema.json",
      },
      descriptor: {
        data: "table.csv",
        dataSchema: "data-schema.json",
        tableSchema: "table-schema.json",
      },
    },
    {
      description: "local paths",
      basepath: "data",
      resource: { data: ["data/table1.csv", "data/table2.csv"] },
      descriptor: { data: ["table1.csv", "table2.csv"] },
    },
    {
      description: "local path and remote path",
      basepath: "data",
      resource: {
        data: "data/table.csv",
        tableSchema: "https://example.com/schema.json",
      },
      descriptor: {
        data: "table.csv",
        tableSchema: "https://example.com/schema.json",
      },
    },
    {
      description: "local path and remote path using withRemote",
      basepath: "data",
      withRemote: true,
      resource: {
        data: "data/table.csv",
        tableSchema: "https://example.com/schema.json",
      },
      descriptor: {
        data: "table.csv",
        tableSchema: "schema.json",
      },
    },
    {
      description: "remote paths with the same filename using withRemote",
      basepath: "data",
      withRemote: true,
      resource: {
        data: [
          "http://example1.com/table.csv",
          "http://example2.com/table.csv",
          "http://example3.com/table.csv",
          "http://example4.com/table.csv.zip",
          "http://example5.com/table.csv.zip",
        ],
      },
      descriptor: {
        data: [
          "table.csv",
          "table-1.csv",
          "table-2.csv",
          "table.csv.zip",
          "table-1.csv.zip",
        ],
      },
    },
    {
      description: "local paths in different folders",
      basepath: "data",
      resource: {
        data: "data/folder1/table.csv",
        tableSchema: "data/folder2/schema.json",
      },
      descriptor: {
        data: "folder1/table.csv",
        tableSchema: "folder2/schema.json",
      },
    },
    {
      description: "local paths in different folders using withoutFolders",
      basepath: "data",
      withoutFolders: true,
      resource: {
        data: "data/folder1/table.csv",
        tableSchema: "data/folder2/schema.json",
      },
      descriptor: {
        data: "folder1-table.csv",
        tableSchema: "folder2-schema.json",
      },
    },
  ])(
    "$description",
    async ({ resource, basepath, withRemote, withoutFolders, descriptor }) => {
      expect(
        await saveResourceFiles(resource, {
          basepath,
          withRemote,
          withoutFolders,
          saveFile: async props => props.denormalizedPath,
        }),
      ).toEqual(descriptor)
    },
  )
})
