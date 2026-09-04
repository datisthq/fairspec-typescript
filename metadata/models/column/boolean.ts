import { z } from "zod"
import { createNullablePropertyType } from "../../actions/column/property.ts"
import { BaseColumn, BaseColumnProperty } from "./base.ts"

export const BooleanColumnProperty = BaseColumnProperty.extend({
  type: createNullablePropertyType("boolean"),
  format: z.never().optional(),

  enum: z
    .array(z.boolean())
    .optional()
    .describe("An optional array of allowed values for the column"),

  const: z.boolean().optional().describe("An optional const that all values must match"),

  default: z
    .array(z.boolean())
    .optional()
    .describe("An optional default value for the column"),

  examples: z
    .array(z.boolean())
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

  trueValues: z
    .array(z.string())
    .optional()
    .describe(
      "An optional array of string values that should be interpreted as true when parsing data",
    ),

  falseValues: z
    .array(z.string())
    .optional()
    .describe(
      "An optional array of string values that should be interpreted as false when parsing data",
    ),
})

export const BooleanColumn = BaseColumn.extend({
  type: z.literal("boolean"),
  property: BooleanColumnProperty,
})

export type BooleanColumn = z.infer<typeof BooleanColumn>
