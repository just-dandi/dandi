import { Constructor } from '@dandi/common'

import { localToken } from '../../src/local-token'

import { InjectionToken } from './injection-token'

export interface InjectionOptions {

  /**
   * When set to `true`, the injection token is intended to be used as a "multi" token, where multiple providers all
   * provide their values when injecting the token. When set to `false`, disables providers from providing this token
   * as a "multi" provider.
   */
  multi?: boolean

  /**
   * When set to `true`, the injector will generate a single instance that will be reused for all subsequent injections.
   */
  singleton?: boolean

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
  providers?: Array<Provider<any>>
}

export interface SyncFactoryProvider<T> extends GeneratorProvider<T> {
  useFactory: (...args: any[]) => T
  async?: false
  deps?: Array<InjectionToken<any>>
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

export type Provider<T> = ClassProvider<T> | FactoryProvider<T> | ValueProvider<T> | AsyncFactoryProvider<T>
export type GeneratingProvider<T> = ClassProvider<T> | FactoryProvider<T> | AsyncFactoryProvider<T>
export type MultiProvider<T> = Provider<T> & { multi: true }
