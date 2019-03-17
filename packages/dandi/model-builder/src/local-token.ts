import { InjectionOptions, InjectionToken, OpinionatedToken, SymbolToken } from '@dandi/core'

/**
 * @ignore
 * @internal
 */
export const PKG = '@dandi/model-builder'

/**
 * @ignore
 * @internal
 */
export function localSymbolToken<T>(target: string): InjectionToken<T> {
  return SymbolToken.local<T>(PKG, target)
}

/**
 * @ignore
 * @internal
 */
export function localOpinionatedToken<T>(target: string, options: InjectionOptions): InjectionToken<T> {
  return OpinionatedToken.local<T>(PKG, target, options)
}
