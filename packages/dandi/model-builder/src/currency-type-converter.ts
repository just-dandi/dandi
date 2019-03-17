import { Currency } from '@dandi/common'
import { Injectable } from '@dandi/core'

import { TypeConverter } from './type-converter'

/**
 * @ignore
 * An implementation of [[TypeConverter]] that converts [[Currency]] values.
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