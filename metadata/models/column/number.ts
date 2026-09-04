import { z } from "zod"
import { createNullablePropertyType } from "../../actions/column/property.ts"
import { BaseColumn, BaseColumnProperty } from "./base.ts"

export const BaseNumberColumnProperty = BaseColumnProperty.extend({
  type: createNullablePropertyType("number"),

  enum: z
    .array(z.number())
    .optional()
    .describe("An optional array of allowed values for the column"),

  const: z.number().optional().describe("An optional const that all values must match"),

  default: z
    .array(z.number())
    .optional()
    .describe("An optional default value for the column"),

  examples: z
    .array(z.number())
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
    .number()
    .optional()
    .describe("An optional minimum value constraint (inclusive)"),

  maximum: z
    .number()
    .optional()
    .describe("An optional maximum value constraint (inclusive)"),

  exclusiveMinimum: z
    .number()
    .optional()
    .describe("An optional minimum value constraint (exclusive)"),

  exclusiveMaximum: z
    .number()
    .optional()
    .describe("An optional maximum value constraint (exclusive)"),

  multipleOf: z
    .number()
    .positive()
    .optional()
    .describe("An optional constraint that values must be a multiple of this number"),

  decimalChar: z
    .string()
    .length(1)
    .optional()
    .describe("An optional single character used as the decimal separator in the data"),

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

export const NumberColumnProperty = BaseNumberColumnProperty.extend({
  format: z.never().optional(),
})

export const NumberColumn = BaseColumn.extend({
  type: z.literal("number"),
  property: NumberColumnProperty,
})

export type NumberColumn = z.infer<typeof NumberColumn>
