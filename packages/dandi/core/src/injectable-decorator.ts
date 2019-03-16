import { Constructor } from '@dandi/common'

import { ProviderOptions } from './provider'
import { Repository } from './repository'
import { InjectionToken, InjectionTokenTypeError, isInjectionToken } from './injection-token'

/**
 * @ignore
 * @internal
 */
export const INJECTABLE_REGISTRATION_SOURCE = {
  constructor: Injectable,
  tag: '.global',
}

export interface InjectableDecorator<T> extends ClassDecorator {
  (options?: InjectionToken<T>): ClassDecorator;
  new (options?: InjectionToken<T>): InjectionToken<T>;
}

export function injectableDecorator<T>(
  injectable: InjectionToken<T>,
  injectableOptions: InjectableOption[],
  target: Constructor<T>,
): void {
  if (injectable && !isInjectionToken(injectable)) {
    throw new InjectionTokenTypeError(injectable)
  }
  const providerOptions: ProviderOptions<T> = {}
  if (injectable) {
    providerOptions.provide = injectable
  }
  injectableOptions.forEach((option) => option.setOptions(providerOptions))
  Repository.global.register(INJECTABLE_REGISTRATION_SOURCE, target, providerOptions)
  Reflect.set(target, ProviderOptions.valueOf() as symbol, providerOptions)
}

/**
 * [[include:injectable-decorator.doc.md#Injectable]]
 * @param token [[include:injectable-decorator.doc.md#Injectable:token]]
 * @param options [[include:injectable-decorator.doc.md#Injectable:options]] [[include:injectable-decorator.doc.md#InjectableOption:values]]
 * @decorator
 */
export function Injectable<T>(token?: InjectionToken<T>, ...options: InjectableOption[]): ClassDecorator

/**
 * [[include:injectable-decorator.doc.md#Injectable]]
 * @param options [[include:injectable-decorator.doc.md#Injectable:options]] [[include:injectable-decorator.doc.md#InjectableOption:values]]
 * @decorator
 */
export function Injectable<T>(...options: InjectableOption[]): ClassDecorator

export function Injectable<T>(
  injectableOrOption: InjectionToken<T> | InjectableOption = undefined,
  ...options: InjectableOption[]
): ClassDecorator {
  const injectable: InjectionToken<T> = isInjectableOption(injectableOrOption) ? undefined : injectableOrOption
  if (isInjectableOption(injectableOrOption)) {
    options.unshift(injectableOrOption)
  }
  return injectableDecorator.bind(undefined, injectable, options)
}


function isInjectableOption(obj: any): obj is InjectableOption {
  return obj instanceof InjectableOption
}

/**
 * A utility class used to set [[InjectableOption]] values for a class decorated with [[@Injectable()]]
 *
 * [[include:injectable-decorator.doc.md#InjectableOption:values]]
 */
export class InjectableOption {
  constructor(private _setOptions: (options: ProviderOptions<any>) => void) {}

  /**
   * @ignore
   */
  public setOptions(options: ProviderOptions<any>): void {
    this._setOptions(options)
  }
}

/**
 * Marks an [[@Injectable()]] decorated class as a singleton
 */
export const Singleton = new InjectableOption((options: ProviderOptions<any>) => (options.singleton = true))

/**
 * Marks an [[@Injectable()]] decorated class as a non-singleton
 */
export const NotSingleton = new InjectableOption((options: ProviderOptions<any>) => (options.singleton = false))

/**
 * Marks an [[@Injectable()]] decorated class as an entry for a multi provider
 */
export const Multi = new InjectableOption((options: ProviderOptions<any>) => (options.multi = true))

/**
 * Marks an [[@Injectable()]] decorated class as singular (non-multi) provider
 */
export const NotMulti = new InjectableOption((options: ProviderOptions<any>) => (options.multi = false))

/**
 * Prevents an [[@Injectable()]] decorated class from being registered as itself
 */
export const NoSelf = new InjectableOption((options: ProviderOptions<any>) => (options.noSelf = true))
