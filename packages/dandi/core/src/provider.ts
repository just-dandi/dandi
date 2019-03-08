import { Constructor } from '@dandi/common'

import { InjectionToken } from './injection-token'
import { localSymbolToken } from './local-token'

export interface InjectionOptions {
  multi?: boolean
  singleton?: boolean
  noSelf?: boolean
  parentsOnly?: boolean
}

export interface ProviderOptions<T> extends InjectionOptions {
  provide?: InjectionToken<T>
}

export const ProviderOptions = localSymbolToken<ProviderOptions<any>>('ProviderOptions')

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
