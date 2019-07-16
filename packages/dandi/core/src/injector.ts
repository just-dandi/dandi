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

export interface Resolver {

  /**
   * Performs a shallow check (not checking dependencies or other parameters) to see if a matching provider
   * has been configured for the specified injection token.
   * @param token - the injection token
   * @param repositories - any additional {Repository} instances to use for resolving the token
   */
  canResolve(token: InjectionToken<any>, ...providers: Array<Provider<any> | Constructor<any>>): boolean
  canResolve(token: InjectionToken<any>, parentResolverContext: ResolverContext<any>, ...providers: Array<Provider<any> | Constructor<any>>): boolean

  resolve<T>(token: InjectionToken<T>, ...providers: Array<Provider<any> | Constructor<any>>): ResolvedProvider<T>
  resolve<T>(token: InjectionToken<T>, optional: boolean, ...providers: Array<Provider<any> | Constructor<any>>): ResolvedProvider<T>
  resolve<T>(token: InjectionToken<T>, parentResolverContext: ResolverContext<any>, ...providers: Array<Provider<any> | Constructor<any>>): ResolvedProvider<T>
  resolve<T>(
    token: InjectionToken<T>,
    parentInjectorContext: ResolverContext<any>,
    optional: boolean,
    ...providers: Array<Provider<any> | Constructor<any>>
  ): ResolvedProvider<T>

}

export type InvokableReturnFn<T> = (...args: any[]) => T | Promise<T>
export type InvokableVoidFn = (...args: any[]) => void | Promise<void>
export type InvokableFn<T = void> = InvokableReturnFn<T> | InvokableVoidFn

export type Filtered<TType, TCondition> = {
  [key in keyof TType]: TType[key] extends TCondition ? key : never
}
export type AllowedKeys<TType, TCondition> = Filtered<TType, TCondition>[keyof TType]
export type Subset<TType, TCondition> = Pick<TType, AllowedKeys<TType, TCondition>>
export type InvokableFns<TInstance, TResult> = Subset<TInstance, InvokableFn<TResult>>
export type InstanceInvokableFn<TInstance, TResult> = keyof InvokableFns<TInstance, TResult>

export function isInjector(obj: any): obj is Injector {
  return obj && typeof obj.inject === 'function' && typeof obj.injectParam === 'function'
}

export interface Invoker {
  invoke<TInstance, TResult>(
    instance: TInstance,
    methodName: InstanceInvokableFn<TInstance, TResult>,
    ...providers: Array<Provider<any> | Constructor<any>>
  ): Promise<TResult>
  invoke<TInstance, TResult>(
    instance: TInstance,
    methodName: InstanceInvokableFn<TInstance, TResult>,
    parentInjectorContext: ResolverContext<any>,
    ...providers: Array<Provider<any> | Constructor<any>>
  ): Promise<TResult>
}

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

export interface Injector extends Resolver, Invoker, TokenInjector {

  init(...args: any[]): Promise<void>

}

export type InjectorFactory = (appInjectorContext: AppInjectorContext, generatorFactory: InstanceGeneratorFactory) => Injector | Promise<Injector>

export const Injector = localOpinionatedToken<Injector>('Injector', {
  multi: false,
  singleton: true,
})
