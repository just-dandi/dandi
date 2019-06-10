import { Currency } from '@dandi/common'
import { Injectable } from '@dandi/core'

import { TypeConverter } from './type-converter'

/**
 * @ignore
 * An implementation of {@see TypeConverter} that converts {@see Currency} values.
 */
@Injectable(TypeConverter)
export class CurrencyTypeConverter implements TypeConverter<Currency> {
  public readonly type = Currency;

  public convert(value: any): Currency {
    const result = Currency.parse(value)
    if (result.valid) {
      return result
    }
  }
}
