import { Constructor } from '@dandi/common'

import { InjectionToken } from './injection-token'
import { localSymbolToken } from './local-token'

/**
 * Options for customizing the injection behavior of a [[Provider]]
 */
export interface InjectionOptions {

  /**
   * Specifies that the [[Provider]] is a [[MultiProvider]].
   */
  multi?: boolean

  /**
   * Specifies that instances generated using the [[Provider]] will be singletons
   */
  singleton?: boolean

  /**
   * Specifies that a [[ClassProvider]] will only be registered using its `provide` value and not its class.
   */
  noSelf?: boolean

  /**
   * Specifies that when resolving the [[InjectionToken]], only [[Provider]] objects defined in the parent
   * [[ResolverContext]] can be used to fulfill the request.
   */
  parentsOnly?: boolean
}

/**
 * A base type for [[Provider]] objects
 */
export interface ProviderOptions<T> extends InjectionOptions {
  provide?: InjectionToken<T>
}

export const ProviderOptions = localSymbolToken<ProviderOptions<any>>('ProviderOptions')

/**
 * A [[Provider]] that defines static value to be used to fulfill an injection request, and can define their own
 * hardcoded [[Provider]] objects that will be used to resolve its dependencies.
 */
export interface ValueProvider<T> extends ProviderOptions<T> {
  provide: InjectionToken<T>
  useValue: T
}

/**
 * A base type for [[GeneratingProvider]] objects that
 */
export interface GeneratorProvider<T> extends ProviderOptions<T> {
  provide: InjectionToken<T>
  providers?: Array<Provider<any>>
}

/**
 * A [[Provider]] that defines a synchronous function to be invoked to fulfill an injection request
 */
export interface SyncFactoryProvider<T> extends GeneratorProvider<T> {
  useFactory: (...args: any[]) => T
  async?: false
  deps?: Array<InjectionToken<any>>
}

/**
 * A [[Provider]] that defines an asynchronous function to be invoked to fulfill an injection request
 */
export interface AsyncFactoryProvider<T> extends GeneratorProvider<T> {
  useFactory: (...args: any[]) => Promise<T>
  async: true
  deps?: Array<InjectionToken<any>>
}

/**
 * A [[Provider]] that defines a function to be invoked to fulfill an injection request
 */
export type FactoryProvider<T> = SyncFactoryProvider<T> | AsyncFactoryProvider<T>

/**
 * A [[Provider]] that defines a class to be instantiated to fulfill an injection request.
 */
export interface ClassProvider<T> extends GeneratorProvider<T> {
  useClass: Constructor<T>
}

/**
 * An object that describes how to instantiate an object or otherwise provide a value that corresponds to an [[InjectionToken]].
 */
export type Provider<T> = ClassProvider<T> | FactoryProvider<T> | ValueProvider<T> | AsyncFactoryProvider<T>

/**
 * A subset of [[Provider]] types that dynamically generate objects.
 */
export type GeneratingProvider<T> = ClassProvider<T> | FactoryProvider<T> | AsyncFactoryProvider<T>

/**
 * A [[Provider]] that defines multiple sources of values for an [[InjectionToken]].
 */
export type MultiProvider<T> = Provider<T> & { multi: true }
