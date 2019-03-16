import { InjectionOptions, InjectionToken, OpinionatedToken, SymbolToken } from '@dandi/core'

/**
 * @internal
 * @ignore
 */
export const PKG = '@dandi/core/logging'

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
