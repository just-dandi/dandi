import { InjectionToken } from './injection-token'
import { OpinionatedToken } from './opinionated-token'
import { InjectionOptions } from './provider'
import { SymbolToken } from './symbol-token'

export const PKG = '@dandi/core'

export function localSymbolToken<T>(target: string): InjectionToken<T> {
  return SymbolToken.local<T>(PKG, target)
}
export function localOpinionatedToken<T>(target: string, options: InjectionOptions): InjectionToken<T> {
  return OpinionatedToken.local<T>(PKG, target, options)
}
