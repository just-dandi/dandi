import { AppError, Constructor, isConstructor } from '@dandi/common'

import { SymbolTokenBase } from './symbol.token'

export interface MappedInjectionToken<TKey, TService> {
  provide: InjectionToken<TService>;
  key: TKey;
}

export type MappedInjectionTokenFactory<T> = (<TKey, TService>(key: TKey) => MappedInjectionToken<TKey, TService>)

export type InjectionToken<T> =
  | SymbolTokenBase<T>
  | Constructor<T>
  | MappedInjectionToken<any, T>
  | MappedInjectionTokenFactory<T>

export function isMappedInjectionToken(obj: any): obj is MappedInjectionToken<any, any> {
  return obj && isInjectionToken(obj.provide) && typeof obj.key !== undefined
}

export function isInjectionToken<T>(obj: any): obj is InjectionToken<T> {
  if (!obj) {
    return false
  }
  if (isConstructor(obj)) {
    return true
  }
  return obj instanceof SymbolTokenBase || isMappedInjectionToken(obj)
}

export class InjectionTokenTypeError extends AppError {
  constructor(public readonly target: any) {
    super('The specified target is not a valid Constructor or SymbolToken')
  }
}

export function getTokenString(token: InjectionToken<any> | Function): string {
  if (typeof token === 'function') {
    return token.name
  }
  return ((isMappedInjectionToken(token) ? token.provide : token) || 'undefined')
    .toString()
    .replace(/[\W-]+/g, '_')
    .replace(/_$/, '')
}
