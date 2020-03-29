import { InjectionToken } from './injection-token'
import { OpinionatedToken } from './opinionated-token'
import { InjectionOptions } from './provider'
import { SymbolToken } from './symbol-token'

export interface LocalTokenFactory {
  symbol<T>(target: string): InjectionToken<T>
  opinionated<T>(target: string, options?: InjectionOptions): OpinionatedToken<T>
  PKG: string
}

export function localTokenFactory(pkg: string): LocalTokenFactory {
  return {
    symbol: <T>(target: string): InjectionToken<T> => SymbolToken.local<T>(pkg, target),
    opinionated<T>(target: string, options: InjectionOptions): OpinionatedToken<T> {
      return OpinionatedToken.local<T>(pkg, target, options)
    },
    PKG: pkg,
  }
}
