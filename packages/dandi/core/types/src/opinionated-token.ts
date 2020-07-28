import { AppError } from '@dandi/common'

import { InjectionToken, MultiInjectionToken, SingleInjectionToken } from './injection-token'
import { InjectionOptions, MultiInjectionOptions, Provider, SingleInjectionOptions } from './provider'
import { SymbolTokenBase } from './symbol-token'

export class OpinionatedToken<T> extends SymbolTokenBase<T> {
  public static local<T>(pkg: string, target: string, options: MultiInjectionOptions): MultiInjectionToken<T>
  public static local<T>(pkg: string, target: string, options: SingleInjectionOptions): SingleInjectionToken<T>
  public static local<T>(pkg: string, target: string, options: InjectionOptions): InjectionToken<T>
  public static local<T>(pkg: string, target: string, options: InjectionOptions): InjectionToken<T> {
    return new OpinionatedToken<T>(`${pkg}#${target}`, options)
  }

  constructor(desc: string, public readonly options: InjectionOptions) {
    super(desc)

    this.ready()
  }
}

export class OpinionatedProviderOptionsConflictError<T> extends AppError {
  constructor(public readonly provider: Provider<T>) {
    super(`ProviderOptions from provider conflict with ProviderOptions from OpinionatedToken ${provider.provide}`)
  }
}

export type OpinionatedSingleToken<T> = OpinionatedToken<T> & {
  options: MultiInjectionOptions
}

export type OpinionatedMultiToken<T> = OpinionatedToken<T> & {
  options: SingleInjectionOptions
}
