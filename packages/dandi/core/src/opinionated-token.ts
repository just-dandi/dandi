import { AppError } from '@dandi/common'

import { InjectionToken } from './injection-token'
import { InjectionOptions, Provider } from './provider'
import { SymbolTokenBase } from './symbol-token'

/**
 * An {@see InjectionToken} that defines a set of {@see InjectionOptions} that cannot be overridden by {@see Provider}s
 */
export class OpinionatedToken<T> extends SymbolTokenBase<T> {
  public static local<T>(pkg: string, target: string, options: InjectionOptions): InjectionToken<T> {
    return new OpinionatedToken<T>(`${pkg}#${target}`, options)
  }

  constructor(desc: string, public readonly options: InjectionOptions) {
    super(desc)

    this.ready()
  }
}

/**
 * Thrown when a {@see Provider} specifies an {@see InjectableOption} that conflicts with one defined by an {@see OpinionatedToken}
 */
export class OpinionatedProviderOptionsConflictError<T> extends AppError {
  constructor(public readonly provider: Provider<T>) {
    super(`ProviderOptions from provider conflict with ProviderOptions from OpinionatedToken ${provider.provide}`)
  }
}
