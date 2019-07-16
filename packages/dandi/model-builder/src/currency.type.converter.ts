import { Currency } from '@dandi/common'
import { Injectable } from '@dandi/core'

import { TypeConverter } from './type.converter'

@Injectable(TypeConverter)
export class CurrencyTypeConverter implements TypeConverter<Currency> {
  public readonly type = Currency

  public convert(value: any): Currency {
    const result = Currency.parse(value)
    if (result.valid) {
      return result
    }
  }
}
