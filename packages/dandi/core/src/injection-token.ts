import { AppError, Constructor, isConstructor } from '@dandi/common'

import { SymbolTokenBase } from './symbol-token'

/**
 * Represents one out of a set of related [[InjectionToken]] values.
 */
export interface MappedInjectionToken<TKey, TService> {
  provide: InjectionToken<TService>
  key: TKey
}

/**
 * A function that can generate [[MappedInjectionToken]] values for `InjectionToken<TService>`
 */
export type MappedInjectionTokenFactory<T> = (<TKey, TService>(key: TKey) => MappedInjectionToken<TKey, TService>)

/**
 * An object or value that can be used to represent an object that can be injected using dependency injection.
 */
export type InjectionToken<T> =
  | SymbolTokenBase<T>
  | Constructor<T>
  | MappedInjectionToken<any, T>
  | MappedInjectionTokenFactory<T>

/**
 * @internal
 * @ignore
 */
export function isMappedInjectionToken(obj: any): obj is MappedInjectionToken<any, any> {
  return obj && isInjectionToken(obj.provide) && typeof obj.key !== undefined
}

/**
 * Returns `true` if `obj` is a valid [[InjectionToken]]; otherwise, `false`
 * @param obj The object to check
 */
export function isInjectionToken<T>(obj: any): obj is InjectionToken<T> {
  if (!obj) {
    return false
  }
  if (isConstructor(obj)) {
    return true
  }
  return obj instanceof SymbolTokenBase || isMappedInjectionToken(obj)
}

/**
 * Thrown when the specified argument is not a valid [[InjectionToken]].
 */
export class InjectionTokenTypeError extends AppError {
  constructor(public readonly target: any) {
    super('The specified target is not a valid Constructor or SymbolToken')
  }
}

/**
 * Returns a string representation of an [[InjectionToken]].
 * @param token The [[InjectionToken]]
 */
export function getTokenString(token: InjectionToken<any> | Function): string {
  if (typeof token === 'function') {
    return token.name
  }
  return ((isMappedInjectionToken(token) ? token.provide : token) || 'undefined')
    .toString()
    .replace(/[\W-]+/g, '_')
    .replace(/_$/, '')
}
