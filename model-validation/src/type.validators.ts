import { DateTimeTypeValidator } from './date.time.type.validator';
import { OneOfTypeValidator } from './one.of.type.validator';
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
  DateTimeTypeValidator,
  NumberTypeValidator,
  OneOfTypeValidator,
  PrimitiveTypeValidator,
  StringTypeValidator,
  UrlTypeValidator,
  UuidTypeValidator,
];
