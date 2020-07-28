import { AppError, Constructor, isConstructor, MultiConstructor, SingleConstructor } from '@dandi/common'

import { OpinionatedMultiToken, OpinionatedSingleToken } from './opinionated-token'
import { SymbolTokenBase } from './symbol-token'

export interface MappedInjectionToken<TKey, TService> {
  provide: InjectionToken<TService>
  key: TKey
}

export type MappedInjectionTokenFactory<T> = <TKey, TService>(key: TKey) => MappedInjectionToken<TKey, TService>

export type ClassDecoratorToken<T> = (...args: any[]) => ClassDecorator

export type InjectionToken<T> =
  | SymbolTokenBase<T>
  | Constructor<T>
  | MappedInjectionToken<any, T>
  | MappedInjectionTokenFactory<T>
  | ClassDecoratorToken<T>

export type SingleInjectionToken<T> = InjectionToken<T> & (SingleConstructor<T> | OpinionatedSingleToken<T>)
export type MultiInjectionToken<T> = InjectionToken<T> & (MultiConstructor<T> | OpinionatedMultiToken<T>)

export function isMultiToken(obj: any): obj is MultiInjectionToken<any> {
  return obj?.options?.multi === true || (obj?.multi === true && isConstructor(obj))
}

export function isSingleToken(obj: any): obj is SingleInjectionToken<any> {
  return obj?.options?.multi === false || (obj?.multi === false && isConstructor(obj))
}

export class InjectionTokenTypeError extends AppError {
  constructor(public readonly target: any) {
    super('The specified target is not a valid Constructor or SymbolToken')
  }
}
