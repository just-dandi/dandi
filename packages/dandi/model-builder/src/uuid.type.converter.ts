import { Uuid } from '@dandi/common'
import { Injectable } from '@dandi/core'
import { UUID_PATTERN } from '@dandi/model'

import { TypeConversionError, TypeConverter } from './type.converter'

@Injectable(TypeConverter)
export class UuidTypeConverter implements TypeConverter<Uuid> {
  public readonly type = Uuid
  public convert(obj: string): Uuid {
    if (!UUID_PATTERN.test(obj)) {
      throw new TypeConversionError(obj, Uuid)
    }
    return Uuid.for(obj)
  }
}
