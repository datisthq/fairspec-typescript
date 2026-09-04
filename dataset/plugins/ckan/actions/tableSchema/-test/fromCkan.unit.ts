import { describe, expect, it } from "vite-plus/test"
import type { CkanSchema } from "../../../models/schema.ts"
import ckanSchemaFixture from "./fixtures/ckan-schema.json" with { type: "json" }
import { convertTableSchemaFromCkan } from "../fromCkan.ts"

describe("convertTableSchemaFromCkan", () => {
  it("converts a CKAN schema to a Fairspec table schema", () => {
    const ckanSchema = ckanSchemaFixture as CkanSchema

    const result = convertTableSchemaFromCkan(ckanSchema)

    expect(Object.keys(result.properties ?? {})).toHaveLength(ckanSchema.fields.length)

    const idColumn = result.properties?.id
    expect(idColumn).toBeDefined()
    if (idColumn) {
      expect(idColumn.type).toEqual("integer")
      expect(idColumn.title).toEqual("ID")
      expect(idColumn.description).toEqual("Unique identifier")
    }

    const nameColumn = result.properties?.name
    expect(nameColumn).toBeDefined()
    if (nameColumn) {
      expect(nameColumn.type).toEqual("string")
      expect(nameColumn.title).toEqual("Name")
      expect(nameColumn.description).toEqual("Person's full name")
    }

    const ageColumn = result.properties?.age
    expect(ageColumn).toBeDefined()
    if (ageColumn) {
      expect(ageColumn.type).toEqual("integer")
      expect(ageColumn.title).toBeUndefined()
      expect(ageColumn.description).toBeUndefined()
    }

    const scoreColumn = result.properties?.score
    expect(scoreColumn).toBeDefined()
    if (scoreColumn) {
      expect(scoreColumn.type).toEqual("number")
      expect(scoreColumn.title).toEqual("Score")
      expect(scoreColumn.description).toEqual("Test score")
    }

    const isActiveColumn = result.properties?.is_active
    expect(isActiveColumn).toBeDefined()
    if (isActiveColumn) {
      expect(isActiveColumn.type).toEqual("boolean")
    }

    const birthDateColumn = result.properties?.birth_date
    expect(birthDateColumn).toBeDefined()
    if (birthDateColumn) {
      expect(birthDateColumn.type).toEqual("string")
      expect(birthDateColumn.format).toEqual("date")
      expect(birthDateColumn.title).toEqual("Birth Date")
      expect(birthDateColumn.description).toEqual("Date of birth")
    }

    const startTimeColumn = result.properties?.start_time
    expect(startTimeColumn).toBeDefined()
    if (startTimeColumn) {
      expect(startTimeColumn.type).toEqual("string")
      expect(startTimeColumn.format).toEqual("time")
    }

    const createdAtColumn = result.properties?.created_at
    expect(createdAtColumn).toBeDefined()
    if (createdAtColumn) {
      expect(createdAtColumn.type).toEqual("string")
      expect(createdAtColumn.format).toEqual("date-time")
      expect(createdAtColumn.title).toEqual("Created At")
      expect(createdAtColumn.description).toEqual("Timestamp when record was created")
    }

    const metadataColumn = result.properties?.metadata
    expect(metadataColumn).toBeDefined()
    if (metadataColumn) {
      expect(metadataColumn.type).toEqual("object")
    }

    const tagsColumn = result.properties?.tags
    expect(tagsColumn).toBeDefined()
    if (tagsColumn) {
      expect(tagsColumn.type).toEqual("array")
      expect(tagsColumn.title).toEqual("Tags")
      expect(tagsColumn.description).toEqual("List of tags")
    }
  })

  it("converts CKAN type aliases to Fairspec types", () => {
    const ckanSchema = ckanSchemaFixture as CkanSchema

    const result = convertTableSchemaFromCkan(ckanSchema)

    const stringColumn = result.properties?.string_field
    expect(stringColumn?.type).toEqual("string")

    const integerColumn = result.properties?.integer_field
    expect(integerColumn?.type).toEqual("integer")

    const numberColumn = result.properties?.number_field
    expect(numberColumn?.type).toEqual("number")

    const floatColumn = result.properties?.float_field
    expect(floatColumn?.type).toEqual("number")

    const booleanColumn = result.properties?.boolean_field
    expect(booleanColumn?.type).toEqual("boolean")

    const datetimeColumn = result.properties?.datetime_field
    expect(datetimeColumn?.type).toEqual("string")
    expect(datetimeColumn?.format).toEqual("date-time")

    const objectColumn = result.properties?.object_field
    expect(objectColumn?.type).toEqual("object")
  })

  it("handles unknown field types by converting to 'string'", () => {
    const ckanSchema = ckanSchemaFixture as CkanSchema

    const result = convertTableSchemaFromCkan(ckanSchema)

    const unknownColumn = result.properties?.unknown_field
    expect(unknownColumn).toBeDefined()
    if (unknownColumn) {
      expect(unknownColumn.type).toEqual("string")
    }
  })

  it("respects type_override in field info", () => {
    const ckanSchema = ckanSchemaFixture as CkanSchema

    const result = convertTableSchemaFromCkan(ckanSchema)

    const overrideColumn = result.properties?.override_field
    expect(overrideColumn).toBeDefined()
    if (overrideColumn) {
      expect(overrideColumn.type).toEqual("integer")
      expect(overrideColumn.title).toEqual("Override Field")
      expect(overrideColumn.description).toEqual("Field with type override")
    }
  })

  it("handles empty fields array", () => {
    const ckanSchema: CkanSchema = {
      fields: [],
    }

    const result = convertTableSchemaFromCkan(ckanSchema)

    expect(Object.keys(result.properties ?? {})).toHaveLength(0)
  })

  it("handles fields without info object", () => {
    const ckanSchema: CkanSchema = {
      fields: [
        {
          id: "simple_field",
          type: "text",
        },
      ],
    }

    const result = convertTableSchemaFromCkan(ckanSchema)

    expect(Object.keys(result.properties ?? {})).toHaveLength(1)
    const column = result.properties?.simple_field
    expect(column).toBeDefined()
    if (column) {
      expect(column.type).toEqual("string")
      expect(column.title).toBeUndefined()
      expect(column.description).toBeUndefined()
    }
  })

  it("handles case insensitivity in type conversion", () => {
    const ckanSchema: CkanSchema = {
      fields: [
        { id: "field1", type: "TEXT" },
        { id: "field2", type: "INT" },
        { id: "field3", type: "BOOL" },
        { id: "field4", type: "TIMESTAMP" },
      ],
    }

    const result = convertTableSchemaFromCkan(ckanSchema)

    expect(result.properties?.field1?.type).toEqual("string")
    expect(result.properties?.field2?.type).toEqual("integer")
    expect(result.properties?.field3?.type).toEqual("boolean")
    expect(result.properties?.field4?.type).toEqual("string")
    expect(result.properties?.field4?.format).toEqual("date-time")
  })
})
