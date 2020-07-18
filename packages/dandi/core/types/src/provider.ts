import { Constructor } from '@dandi/common'

import { localToken } from '../../src/local-token'

import { InjectionToken } from './injection-token'
import { ScopeRestriction } from './scope-restriction'

export interface InjectionOptions {
  /**
   * When set to `true`, the injection token is intended to be used as a "multi" token, where multiple providers all
   * provide their values when injecting the token. When set to `false`, disables providers from providing this token
   * as a "multi" provider.
   */
  multi?: boolean

  /**
   * When set to `true`, and registering an injectable as a provider for different injection token, the injectable is
   * not registered as itself in addition to the other injection token.
   */
  noSelf?: boolean

  /**
   * When true, the injector will not inject this token using providers from the same injection context, instead using
   * only providers available from a parent.
   */
  parentsOnly?: boolean

  /**
   * Only allows the token to be injected as a child of the specified scope.
   */
  restrictScope?: ScopeRestriction
}

export interface ProviderOptions<T> extends InjectionOptions {
  provide?: InjectionToken<T>
}

export const ProviderOptions = localToken.symbol<ProviderOptions<any>>('ProviderOptions')

export interface ValueProvider<T> extends ProviderOptions<T> {
  provide: InjectionToken<T>
  useValue: T
}

export interface GeneratorProvider<T> extends ProviderOptions<T> {
  provide: InjectionToken<T>
  providers?: (Provider<any> | Constructor)[]
}

export interface SyncFactoryProvider<T> extends GeneratorProvider<T> {
  useFactory: (...args: any[]) => T
  async?: false
  deps?: InjectionToken<any>[]
}

export interface AsyncFactoryProvider<T> extends GeneratorProvider<T> {
  useFactory: (...args: any[]) => Promise<T>
  async: true
  deps?: Array<InjectionToken<any>>
}

export type FactoryProvider<T> = SyncFactoryProvider<T> | AsyncFactoryProvider<T>

export interface ClassProvider<T> extends GeneratorProvider<T> {
  useClass: Constructor<T>
}

export type Provider<T> = ClassProvider<T> | FactoryProvider<T> | ValueProvider<T>
export type GeneratingProvider<T> = ClassProvider<T> | FactoryProvider<T>
export type MultiProvider<T> = Provider<T> & { multi: true }
