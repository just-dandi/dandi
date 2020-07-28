import { InjectionToken, MultiInjectionToken, SingleInjectionToken } from './injection-token'
import { OpinionatedToken } from './opinionated-token'
import { InjectionOptions, MultiInjectionOptions, SingleInjectionOptions } from './provider'
import { SymbolToken } from './symbol-token'

export class LocalTokenFactory {
  constructor(public readonly PKG: string) {}

  public symbol<T>(target: string): InjectionToken<T> {
    return SymbolToken.local<T>(this.PKG, target)
  }

  public opinionated<T>(target: string, options: MultiInjectionOptions): MultiInjectionToken<T>
  public opinionated<T>(target: string, options: SingleInjectionOptions): SingleInjectionToken<T>
  public opinionated<T>(target: string, options: InjectionOptions): InjectionToken<T>
  public opinionated<T>(target: string, options: InjectionOptions): InjectionToken<T> {
    return OpinionatedToken.local<T>(this.PKG, target, options)
  }
}

export function localTokenFactory(pkg: string): LocalTokenFactory {
  return new LocalTokenFactory(pkg)
}
