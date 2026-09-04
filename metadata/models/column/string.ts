import { z } from "zod"
import { createNullablePropertyType } from "../../actions/column/property.ts"
import { BaseColumn, BaseColumnProperty } from "./base.ts"

export const BaseStringColumnProperty = BaseColumnProperty.extend({
  type: createNullablePropertyType("string"),

  enum: z
    .array(z.string())
    .optional()
    .describe("An optional array of allowed values for the column"),

  const: z.string().optional().describe("An optional const that all values must match"),

  default: z
    .array(z.string())
    .optional()
    .describe("An optional default value for the column"),

  examples: z
    .array(z.string())
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

  minLength: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe("An optional minimum length constraint for string values"),

  maxLength: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe("An optional maximum length constraint for string values"),

  pattern: z
    .string()
    .optional()
    .describe("An optional regular expression pattern that values must match"),
})

export const StringColumnProperty = BaseStringColumnProperty.extend({
  format: z.never().optional(),
})

export const StringColumn = BaseColumn.extend({
  type: z.literal("string"),
  property: StringColumnProperty,
})

export type StringColumn = z.infer<typeof StringColumn>
