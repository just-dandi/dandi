import { AppError, Constructor } from '@dandi/common';
import { InjectionToken, MappedInjectionToken } from '@dandi/core';
import { MemberMetadata } from '@dandi/model';

import { localOpinionatedToken } from './local.token';

export interface TypeValidator<T> {
  validate(value: any, metadata?: MemberMetadata): T;
  type: Constructor<T>;
}

export type ValidatedType = Constructor<any> | ((...args: any[]) => ParameterDecorator);

export const TypeValidator: InjectionToken<TypeValidator<any>> = localOpinionatedToken('TypeValidator', {
  multi: true,
});

export class TypeValidationError extends AppError {
  constructor(public readonly value: any, public readonly type: any) {
    super(`${value} is not a valid ${type.name}`);
  }
}
