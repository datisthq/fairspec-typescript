import { z } from "zod"
import { createNullablePropertyType } from "../../actions/column/property.ts"
import { BaseColumn, BaseColumnProperty } from "./base.ts"

export const BaseIntegerColumnProperty = BaseColumnProperty.extend({
  type: createNullablePropertyType("integer"),

  enum: z
    .array(z.int())
    .optional()
    .describe("An optional array of allowed values for the column"),

  const: z.int().optional().describe("An optional const that all values must match"),

  default: z
    .array(z.int())
    .optional()
    .describe("An optional default value for the column"),

  examples: z
    .array(z.int())
    .optional()
    .describe("An optional array of examples for the column"),

  missingValues: z
    .array(
      z.union([
        z.string(),
        z.int(),
        z.object({
          value: z.union([z.string(), z.int()]),
          label: z.string(),
        }),
      ]),
    )
    .optional()
    .describe(
      "An optional column-specific list of values that represent missing or null data",
    ),

  minimum: z
    .int()
    .optional()
    .describe("An optional minimum value constraint (inclusive)"),

  maximum: z
    .int()
    .optional()
    .describe("An optional maximum value constraint (inclusive)"),

  exclusiveMinimum: z
    .int()
    .optional()
    .describe("An optional minimum value constraint (exclusive)"),

  exclusiveMaximum: z
    .int()
    .optional()
    .describe("An optional maximum value constraint (exclusive)"),

  multipleOf: z
    .int()
    .min(1)
    .optional()
    .describe("An optional constraint that values must be a multiple of this number"),

  groupChar: z
    .string()
    .length(1)
    .optional()
    .describe("An optional single character used as the thousands separator in the data"),

  withText: z
    .boolean()
    .optional()
    .describe(
      "An optional boolean indicating whether numeric values may include non-numeric text that should be stripped during parsing",
    ),
})

export const IntegerColumnProperty = BaseIntegerColumnProperty.extend({
  format: z.never().optional(),
})

export const IntegerColumn = BaseColumn.extend({
  type: z.literal("integer"),
  property: IntegerColumnProperty,
})

export type IntegerColumn = z.infer<typeof IntegerColumn>
