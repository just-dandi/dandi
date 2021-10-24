import {
  AppError,
  Constructor,
  hasOwnProperty,
  isConstructor,
  MultiConstructor,
  SingleConstructor,
} from '@dandi/common'

import { OpinionatedMultiToken, OpinionatedSingleToken } from './opinionated-token'
import { SymbolTokenBase } from './symbol-token'

export interface MappedInjectionToken<TKey, TService> {
  provide: InjectionToken<TService>
  key: TKey
}

export type MappedInjectionTokenFactory = <TKey, TService>(key: TKey) => MappedInjectionToken<TKey, TService>

export type ClassDecoratorToken = (...args: unknown[]) => ClassDecorator

export type InjectionToken<T = unknown> =
  | SymbolTokenBase<T>
  | Constructor<T>
  | MappedInjectionToken<unknown, T>
  | MappedInjectionTokenFactory
  | ClassDecoratorToken

export type SingleInjectionToken<T = unknown> = InjectionToken<T> &
  (SingleConstructor<T> | OpinionatedSingleToken<T>)
export type MultiInjectionToken<T = unknown> = InjectionToken<T> & (MultiConstructor<T> | OpinionatedMultiToken<T>)

export function isMultiToken(obj: unknown): obj is MultiInjectionToken {
  if (hasOwnProperty(obj, 'options') && hasOwnProperty(obj.options, 'multi') && obj.options.multi === true) {
    return true
  }
  return hasOwnProperty(obj, 'multi') === true && isConstructor(obj)
}

export function isSingleToken(obj: unknown): obj is SingleInjectionToken {
  if (hasOwnProperty(obj, 'options') && hasOwnProperty(obj.options, 'multi') && obj.options.multi === false) {
    return true
  }
  return hasOwnProperty(obj, 'multi') === false && isConstructor(obj)
}

export class InjectionTokenTypeError extends AppError {
  constructor(public readonly target: unknown) {
    super('The specified target is not a valid Constructor or SymbolToken')
  }
}
