import { Url } from '@dandi/common'
import { Injectable } from '@dandi/core'

import { TypeConverter } from './type-converter'

@Injectable(TypeConverter)
export class UrlTypeConverter implements TypeConverter<Url> {
  public readonly type = Url;
  public convert(value: string): Url {
    return new Url(value)
  }
}
