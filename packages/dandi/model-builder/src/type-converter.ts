import { AppError, Constructor, PrimitiveConstructor } from '@dandi/common'
import { MemberMetadata } from '@dandi/model'

import { localToken } from './local-token'

export interface TypeConverter<T> {
  convert(value: any, metadata?: MemberMetadata): T
  type: T extends boolean | number | string ? PrimitiveConstructor<T> : Constructor<T>
}

export type ConvertedType = Constructor | ((...args: any[]) => ParameterDecorator)

export const TypeConverter = localToken.opinionated<TypeConverter<any>>('TypeConverter', {
  multi: true,
})

export class TypeConversionError extends AppError {
  constructor(public readonly value: any, public readonly type: any) {
    super(`${value} is not a valid ${type.name}`)
  }
}
