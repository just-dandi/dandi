import { AppError, Constructor } from '@dandi/common'
import { Inject, Injectable } from '@dandi/core'
import { MemberMetadata } from '@dandi/model'

import { TypeConversionError, TypeConverter } from './type-converter'

@Injectable(TypeConverter)
export class StringTypeConverter implements TypeConverter<string> {
  public readonly type = String
  public convert(obj: string): string {
    return obj
  }
}

@Injectable(TypeConverter)
export class NumberTypeConverter implements TypeConverter<number> {
  public readonly type = Number
  public convert(obj: string): number {
    const result = Number(obj)
    if (isNaN(result)) {
      throw new TypeConversionError(obj, Number)
    }
    return result
  }
}

@Injectable(TypeConverter)
export class BooleanTypeConverter implements TypeConverter<boolean> {
  public readonly type = Boolean
  public convert(obj: any): boolean {
    if (obj === true || obj === false) {
      return obj
    }
    if (obj === 0) {
      return false
    }
    if (obj === 1) {
      return true
    }
    if (typeof obj === 'string') {
      if (obj.toLocaleLowerCase() === 'true') {
        return true
      }
      if (obj.toLocaleLowerCase() === 'false') {
        return false
      }
    }
    throw new TypeConversionError(obj, Boolean)
  }
}

@Injectable()
export class PrimitiveTypeConverter {
  private primitive = new Map<Constructor<any>, TypeConverter<any>>()

  constructor(@Inject(TypeConverter) converters: TypeConverter<any>[]) {
    if (converters) {
      converters.forEach((converter) => this.primitive.set(converter.type, converter))
    }
  }

  public convert(value: any, metadata?: MemberMetadata): any {
    const primitiveConverter = this.primitive.get(metadata.type)
    if (!primitiveConverter) {
      throw new AppError(`${metadata.type} cannot be converter by ${this.constructor.name}`)
    }
    return primitiveConverter.convert(value, metadata)
  }
}
