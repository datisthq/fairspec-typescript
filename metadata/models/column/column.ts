import { z } from "zod"
import { ArrayColumn, ArrayColumnProperty } from "./array.ts"
import { Base64Column, Base64ColumnProperty } from "./base64.ts"
import { BooleanColumn, BooleanColumnProperty } from "./boolean.ts"
import {
  CategoricalColumn,
  IntegerCategoricalColumnProperty,
  StringCategoricalColumnProperty,
} from "./categorical.ts"
import { DateColumn, DateColumnProperty } from "./date.ts"
import { DateTimeColumn, DateTimeColumnProperty } from "./dateTime.ts"
import { DecimalColumn, DecimalColumnProperty } from "./decimal.ts"
import { DurationColumn, DurationColumnProperty } from "./duration.ts"
import { EmailColumn, EmailColumnProperty } from "./email.ts"
import { GeojsonColumn, GeojsonColumnProperty } from "./geojson.ts"
import { HexColumn, HexColumnProperty } from "./hex.ts"
import { IntegerColumn, IntegerColumnProperty } from "./integer.ts"
import { ListColumn, ListColumnProperty } from "./list.ts"
import { NumberColumn, NumberColumnProperty } from "./number.ts"
import { ObjectColumn, ObjectColumnProperty } from "./object.ts"
import { StringColumn, StringColumnProperty } from "./string.ts"
import { TimeColumn, TimeColumnProperty } from "./time.ts"
import { TopojsonColumn, TopojsonColumnProperty } from "./topojson.ts"
import { UnknownColumn, UnknownColumnProperty } from "./unknown.ts"
import { UrlColumn, UrlColumnProperty } from "./url.ts"
import { WkbColumn, WkbColumnProperty } from "./wkb.ts"
import { WktColumn, WktColumnProperty } from "./wkt.ts"

export const Column = z.discriminatedUnion("type", [
  ArrayColumn,
  Base64Column,
  BooleanColumn,
  CategoricalColumn,
  DateColumn,
  DateTimeColumn,
  DecimalColumn,
  DurationColumn,
  EmailColumn,
  GeojsonColumn,
  HexColumn,
  IntegerColumn,
  ListColumn,
  NumberColumn,
  ObjectColumn,
  StringColumn,
  TimeColumn,
  TopojsonColumn,
  UnknownColumn,
  UrlColumn,
  WkbColumn,
  WktColumn,
])

export const ColumnType = z.enum([
  "array",
  "base64",
  "boolean",
  "categorical",
  "date",
  "date-time",
  "decimal",
  "duration",
  "email",
  "geojson",
  "hex",
  "integer",
  "list",
  "number",
  "object",
  "string",
  "time",
  "topojson",
  "unknown",
  "url",
  "wkb",
  "wkt",
])

const StringColumnPropertyWithFormat = z.discriminatedUnion("format", [
  ListColumnProperty,
  Base64ColumnProperty,
  HexColumnProperty,
  EmailColumnProperty,
  UrlColumnProperty,
  DateTimeColumnProperty,
  DateColumnProperty,
  TimeColumnProperty,
  DurationColumnProperty,
  WktColumnProperty,
  WkbColumnProperty,
  StringCategoricalColumnProperty,
  DecimalColumnProperty,
])

const ObjectColumnPropertyWithFormat = z.discriminatedUnion("format", [
  GeojsonColumnProperty,
  TopojsonColumnProperty,
])

export const ColumnProperty = z.union([
  BooleanColumnProperty,
  IntegerCategoricalColumnProperty,
  IntegerColumnProperty,
  NumberColumnProperty,
  StringColumnPropertyWithFormat,
  StringColumnProperty,
  ArrayColumnProperty,
  ObjectColumnPropertyWithFormat,
  ObjectColumnProperty,
  UnknownColumnProperty,
])

export type Column = z.infer<typeof Column>
export type ColumnType = z.infer<typeof ColumnType>
export type ColumnProperty = z.infer<typeof ColumnProperty>
