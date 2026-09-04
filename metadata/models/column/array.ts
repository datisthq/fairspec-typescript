import { z } from "zod"
import { createNullablePropertyType } from "../../actions/column/property.ts"
import { BaseColumn, BaseColumnProperty } from "./base.ts"

// TODO: Should allow all the JSON Schema properties

export const ArrayColumnProperty = BaseColumnProperty.extend({
  type: createNullablePropertyType("array"),
  format: z.never().optional(),

  enum: z
    .array(z.unknown())
    .optional()
    .describe("An optional array of allowed values for the column"),

  const: z
    .array(z.unknown())
    .optional()
    .describe("An optional const that all values must match"),

  default: z
    .array(z.array(z.unknown()))
    .optional()
    .describe("An optional default value for the column"),

  examples: z
    .array(z.array(z.unknown()))
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
  items: z.unknown().optional(),
  prefixItems: z.unknown().optional(),
  additionalItems: z.unknown().optional(),
  contains: z.unknown().optional(),
  minContains: z.number().optional(),
  maxContains: z.number().optional(),
  maxItems: z.number().optional(),
  minItems: z.number().optional(),
  uniqueItems: z.boolean().optional(),
})

export const ArrayColumn = BaseColumn.extend({
  type: z.literal("array"),
  property: ArrayColumnProperty,
})

export type ArrayColumn = z.infer<typeof ArrayColumn>
