import { Currency, Injectable } from '@dandi/core';
import { MemberMetadata } from '@dandi/model';

import { TypeValidator } from './type.validator';

@Injectable(TypeValidator)
export class CurrencyTypeValidator implements TypeValidator<Currency> {
  public readonly type = Currency;
  public validate(value: any, metadata?: MemberMetadata): Currency {
    const result = Currency.parse(value);
    if (result.valid) {
      return result;
    }
  }
}
