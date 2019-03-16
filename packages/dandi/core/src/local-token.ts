import { InjectionToken } from './injection-token'
import { OpinionatedToken } from './opinionated-token'
import { InjectionOptions } from './provider'
import { SymbolToken } from './symbol-token'

/**
 * @internal
 * @ignore
 */
export const PKG = '@dandi/core'

/**
 * @internal
 * @ignore
 */
export function localSymbolToken<T>(target: string): InjectionToken<T> {
  return SymbolToken.local<T>(PKG, target)
}

/**
 * @internal
 * @ignore
 */
export function localOpinionatedToken<T>(target: string, options: InjectionOptions): InjectionToken<T> {
  return OpinionatedToken.local<T>(PKG, target, options)
}
