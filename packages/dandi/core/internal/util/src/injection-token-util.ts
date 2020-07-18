import { isConstructor } from '@dandi/common'
import { InjectionToken, MappedInjectionToken, SymbolTokenBase } from '@dandi/core/types'

export function isMappedInjectionToken(obj: any): obj is MappedInjectionToken<any, any> {
  return obj && isInjectionToken(obj.provide) && typeof obj.key !== 'undefined'
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

export function getTokenString(token: InjectionToken<any> | Function): string {
  if (typeof token === 'function') {
    return token.name
  }
  return ((isMappedInjectionToken(token) ? token.provide : token) || 'undefined').toString()
  // .replace(/[\W-]+/g, '_')
  // .replace(/_$/, '')
}
