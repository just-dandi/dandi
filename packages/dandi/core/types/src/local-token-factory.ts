import { InjectionToken, MultiInjectionToken, SingleInjectionToken } from './injection-token'
import { OpinionatedToken } from './opinionated-token'
import { InjectionOptions, MultiInjectionOptions, SingleInjectionOptions } from './provider'
import { SymbolToken } from './symbol-token'

export class LocalTokenFactory<TPkg extends string> {
  constructor(public readonly PKG: TPkg) {}

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

export function localTokenFactory<TPkg extends string>(pkg: TPkg): LocalTokenFactory<TPkg> {
  return new LocalTokenFactory(pkg)
}
