import { z } from "zod"
import { createNullablePropertyType } from "../../actions/column/property.ts"
import { BaseColumn, BaseColumnProperty } from "./base.ts"

// TODO: Should allow all the JSON Schema properties

export const BaseObjectColumnProperty = BaseColumnProperty.extend({
  type: createNullablePropertyType("object"),

  enum: z
    .array(z.record(z.string(), z.unknown()))
    .optional()
    .describe("An optional array of allowed values for the column"),

  const: z
    .record(z.string(), z.unknown())
    .optional()
    .describe("An optional const that all values must match"),

  default: z
    .array(z.record(z.string(), z.unknown()))
    .optional()
    .describe("An optional default value for the column"),

  examples: z
    .array(z.record(z.string(), z.unknown()))
    .optional()
    .describe("An optional array of examples for the column"),

  missingValues: z
    .array(
      z.union([
        z.string(),
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      ]),
    )
    .optional()
    .describe(
      "An optional column-specific list of values that represent missing or null data",
    ),

  // JSON Schema properties

  allOf: z.unknown().optional(),
  anyOf: z.unknown().optional(),
  oneOf: z.unknown().optional(),
  not: z.unknown().optional(),
  if: z.unknown().optional(),
  then: z.unknown().optional(),
  else: z.unknown().optional(),
  properties: z.unknown().optional(),
  additionalProperties: z.unknown().optional(),
  patternProperties: z.unknown().optional(),
  propertyNames: z.unknown().optional(),
  minProperties: z.number().optional(),
  maxProperties: z.number().optional(),
  dependencies: z.unknown().optional(),
  dependentRequired: z.unknown().optional(),
  dependentSchemas: z.unknown().optional(),
  required: z.unknown().optional(),
})

export const ObjectColumnProperty = BaseObjectColumnProperty.extend({
  format: z.never().optional(),
})

export const ObjectColumn = BaseColumn.extend({
  type: z.literal("object"),
  property: ObjectColumnProperty,
})

export type ObjectColumn = z.infer<typeof ObjectColumn>
