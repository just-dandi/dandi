import { AppError, Constructor } from '@dandi/common'
import { InjectionToken } from '@dandi/core'
import { MemberMetadata } from '@dandi/model'

import { localOpinionatedToken } from './local.token'

export interface TypeConverter<T> {
  convert(value: any, metadata?: MemberMetadata): T;
  type: Constructor<T>;
}

export type ConvertedType = Constructor<any> | ((...args: any[]) => ParameterDecorator)

export const TypeConverter: InjectionToken<TypeConverter<any>> = localOpinionatedToken('TypeConverter', {
  multi: true,
})

export class TypeConversionError extends AppError {
  constructor(public readonly value: any, public readonly type: any) {
    super(`${value} is not a valid ${type.name}`)
  }
}
