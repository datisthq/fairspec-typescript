import { z } from "zod"
import { BaseColumn, BaseColumnProperty } from "./base.ts"

export const UnknownColumnProperty = BaseColumnProperty.extend({
  type: z.literal("null").optional(),
  format: z.never().optional(),

  enum: z
    .array(z.array(z.unknown()))
    .optional()
    .describe("An optional array of allowed values for the column"),

  const: z
    .array(z.unknown())
    .optional()
    .describe("An optional const that all values must match"),

  default: z
    .array(z.unknown())
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
})

export const UnknownColumn = BaseColumn.extend({
  type: z.literal("unknown"),
  property: UnknownColumnProperty,
})

export type UnknownColumn = z.infer<typeof UnknownColumn>
