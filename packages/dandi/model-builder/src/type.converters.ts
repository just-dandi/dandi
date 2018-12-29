import { CurrencyTypeConverter } from './currency.type.converter'
import { DateTimeTypeConverter } from './date.time.type.converter'
import {
  BooleanTypeConverter,
  NumberTypeConverter,
  PrimitiveTypeConverter,
  StringTypeConverter,
} from './primitive.type.converter'
import { UrlTypeConverter } from './url.type.converter'
import { UuidTypeConverter } from './uuid.type.converter'

export const TypeConverters = [
  BooleanTypeConverter,
  CurrencyTypeConverter,
  DateTimeTypeConverter,
  NumberTypeConverter,
  PrimitiveTypeConverter,
  StringTypeConverter,
  UrlTypeConverter,
  UuidTypeConverter,
]
