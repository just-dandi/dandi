import { InjectionOptions, InjectionToken, OpinionatedToken, SymbolToken } from '@dandi/core'

import { PACKAGE_NAME } from './package'

export function localSymbolTokenFor<T>(target: string): InjectionToken<T> {
  return SymbolToken.forLocal<T>(PACKAGE_NAME, target)
}

export function localSymbolToken<T>(target: string): InjectionToken<T> {
  return SymbolToken.local<T>(PACKAGE_NAME, target)
}
export function localOpinionatedToken<T>(target: string, options: InjectionOptions): InjectionToken<T> {
  return OpinionatedToken.local<T>(PACKAGE_NAME, target, options)
}
