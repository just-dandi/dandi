import { AppInjectorContext } from '@dandi/core/src/app-injector-context'

import { Constructor } from '@dandi/common'

import { InjectionContext } from './injection-context'
import { InjectionToken } from './injection-token'
import { InjectionResult } from './injection-result'
import { InstanceGeneratorFactory } from './instance-generator'
import { localOpinionatedToken } from './local-token'
import { Provider } from './provider'
import { ResolverContext } from './resolver-context'

export type ResolvedProvider<T> = Provider<T> | Set<Provider<T>>

/**
 * A service that is responsible for resolving [[InjectionToken]]s to [[Provider]]s.
 */
export interface Resolver {

  /**
   * Performs a shallow check (not checking dependencies or other parameters) to see if a matching provider
   * has been configured for the specified [[InjectionToken]].
   * @param token [[include:injector.doc.md#resolve:token]]
   * @param providers [[include:injector.doc.md#shared:providers]]
   */
  canResolve(token: InjectionToken<any>, ...providers: Array<Provider<any> | Constructor<any>>): boolean
  canResolve(token: InjectionToken<any>, parentResolverContext: ResolverContext<any>, ...providers: Array<Provider<any> | Constructor<any>>): boolean

  /**
   * [[include:injector.doc.md#resolve]]
   * @param token [[include:injector.doc.md#resolve:token]]
   * @param providers [[include:injector.doc.md#shared:providers]]
   */
  resolve<T>(token: InjectionToken<T>, ...providers: Array<Provider<any> | Constructor<any>>): ResolvedProvider<T>

  /**
   * [[include:injector.doc.md#resolve]]
   * @param token [[include:injector.doc.md#resolve:token]]
   * @param optional [[include:injector.doc.md#shared:optional]]
   * @param providers [[include:injector.doc.md#shared:providers]]
   */
  resolve<T>(token: InjectionToken<T>, optional: boolean, ...providers: Array<Provider<any> | Constructor<any>>): ResolvedProvider<T>

  /**
   * [[include:injector.doc.md#resolve]]
   * @param token [[include:injector.doc.md#resolve:token]]
   * @param parentResolverContext [[include:injector.doc.md#shared:parent-resolver-context]]
   * @param providers [[include:injector.doc.md#shared:providers]]
   */
  resolve<T>(token: InjectionToken<T>, parentResolverContext: ResolverContext<any>, ...providers: Array<Provider<any> | Constructor<any>>): ResolvedProvider<T>

  /**
   * [[include:injector.doc.md#resolve]]
   * @param token [[include:injector.doc.md#resolve:token]]
   * @param parentResolverContext [[include:injector.doc.md#shared:parent-resolver-context]]
   * @param optional [[include:injector.doc.md#shared:optional]]
   * @param providers [[include:injector.doc.md#shared:providers]]
   */
  resolve<T>(
    token: InjectionToken<T>,
    parentResolverContext: ResolverContext<any>,
    optional: boolean,
    ...providers: Array<Provider<any> | Constructor<any>>
  ): ResolvedProvider<T>

}

/**
 * An invokable function that returns a value
 */
export type InvokableReturnFn<T> = (...args: any[]) => T | Promise<T>

/**
 * An invokable function that does not return a value
 */
export type InvokableVoidFn = (...args: any[]) => void | Promise<void>

/**
 * An invokable function
 */
export type InvokableFn<T = void> = InvokableReturnFn<T> | InvokableVoidFn

export type Filtered<TType, TCondition> = {
  [key in keyof TType]: TType[key] extends TCondition ? key : never
}
export type AllowedKeys<TType, TCondition> = Filtered<TType, TCondition>[keyof TType]
export type Subset<TType, TCondition> = Pick<TType, AllowedKeys<TType, TCondition>>
export type InvokableFns<TInstance, TResult> = Subset<TInstance, InvokableFn<TResult>>

/**
 * A member of `TInstance` that is public and an invokable function
 */
export type InstanceInvokableFn<TInstance, TResult> = keyof InvokableFns<TInstance, TResult>

/**
 * Returns `true` if `obj` implements the members of [[Injector]]; otherwise, `false`.
 * @param obj The object to check
 */
export function isInjector(obj: any): obj is Injector {
  return obj && typeof obj.inject === 'function' && typeof obj.injectParam === 'function'
}

/**
 * A service that is responsible for invoking methods whose parameters are decorated with [[Inject]] decorators.
 */
export interface Invoker {

  /**
   * [[include:injector.doc.md#invoke]]
   * @param instance [[include:injector.doc.md#invoke:instance]]
   * @param methodName [[include:injector.doc.md#invoke:methodName]]
   * @param providers [[include:injector.doc.md#shared:providers]]
   */
  invoke<TInstance, TResult>(
    instance: TInstance,
    methodName: InstanceInvokableFn<TInstance, TResult>,
    ...providers: Array<Provider<any> | Constructor<any>>
  ): Promise<TResult>

  /**
   * [[include:injector.doc.md#invoke]]
   * @param instance [[include:injector.doc.md#invoke:instance]]
   * @param methodName [[include:injector.doc.md#invoke:methodName]]
   * @param parentResolverContext [[include:injector.doc.md#shared:parent-resolver-context]]
   * @param providers [[include:injector.doc.md#shared:providers]]
   */
  invoke<TInstance, TResult>(
    instance: TInstance,
    methodName: InstanceInvokableFn<TInstance, TResult>,
    parentResolverContext: ResolverContext<any>,
    ...providers: Array<Provider<any> | Constructor<any>>
  ): Promise<TResult>
}

/**
 * A service that is responsible for taking [[InjectionToken]] objects and creating the corresponding object instance
 * configured by their provider.
 */
export interface TokenInjector {

  inject<T>(token: InjectionToken<T>, ...providers: Array<Provider<any> | Constructor<any>>): Promise<InjectionResult<T>>
  inject<T>(token: InjectionToken<T>, optional: boolean, ...providers: Array<Provider<any> | Constructor<any>>): Promise<InjectionResult<T>>
  inject<T>(token: InjectionToken<T>, parentResolverContext: ResolverContext<any>, ...providers: Array<Provider<any> | Constructor<any>>): Promise<InjectionResult<T>>
  inject<T>(token: InjectionToken<T>, parentResolverContext: ResolverContext<any>, optional: boolean, ...providers: Array<Provider<any> | Constructor<any>>): Promise<InjectionResult<T>>

  injectParam<T>(
    token: InjectionToken<T>,
    optional: boolean,
    parentResolverContext: ResolverContext<T>,
    providers: Array<Provider<any> | Constructor<any>>,
    injectionContext: InjectionContext,
  ): Promise<T | T[]>

}

/**
 * A service that combines the responsibilities of [[Resolver]], [[Invoker]], and [[TokenInjector]].
 */
export interface Injector extends Resolver, Invoker, TokenInjector {

  /**
   * Executes any initialization logic required by the [[Injector]] implementation. Called by [[DandiApplication]] as
   * part of the `init` application lifecycle step. Returns a `Promise<void>` that is resolved when initialization is
   * complete.
   * @param args
   */
  init(...args: any[]): Promise<void>

}

/**
 * @internal
 * @ignore
 */
export type InjectorFactory = (appInjectorContext: AppInjectorContext, generatorFactory: InstanceGeneratorFactory) => Injector | Promise<Injector>

export const Injector = localOpinionatedToken<Injector>('Injector', {
  multi: false,
  singleton: true,
})
