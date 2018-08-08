import { CurrencyTypeValidator } from './currency.type.validator';
import { DateTimeTypeValidator } from './date.time.type.validator';
import {
  BooleanTypeValidator,
  NumberTypeValidator,
  PrimitiveTypeValidator,
  StringTypeValidator,
} from './primitive.type.validator';
import { UrlTypeValidator } from './url.type.validator';
import { UuidTypeValidator } from './uuid.type.validator';

export const TypeValidators = [
  BooleanTypeValidator,
  CurrencyTypeValidator,
  DateTimeTypeValidator,
  NumberTypeValidator,
  PrimitiveTypeValidator,
  StringTypeValidator,
  UrlTypeValidator,
  UuidTypeValidator,
];
