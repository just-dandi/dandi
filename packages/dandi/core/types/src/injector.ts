import { localToken } from '../../src/local-token'

import { InjectionToken } from './injection-token'
import { InjectionScope } from './injection-scope'
import { InjectionResult } from './injection-result'
import { Provider } from './provider'
import { RegistrationSource } from './registration-source'
import { Registerable } from './registerable'
import { InjectorContext } from './injector-context'
import { ResolverContext } from './resolver-context'

export type ResolvedProvider<T> = Provider<T> | Set<Provider<T>>

export interface Resolver {

  /**
   * Performs a shallow check (not checking dependencies or other parameters) to see if a matching provider
   * has been configured for the specified injection token.
   * @param token - the injection token
   * @param providers - any additional {Provider} instances to use for resolving the token
   */
  canResolve(token: InjectionToken<any>, ...providers: Registerable[]): boolean

  resolve<T>(token: InjectionToken<T>, ...providers: Registerable[]): ResolvedProvider<T>
  resolve<T>(
    token: InjectionToken<T>,
    optional: boolean,
    ...providers: Registerable[]
  ): ResolvedProvider<T>

}

export type InvokableReturnFn<T> = (...args: any[]) => T | Promise<T>
export type InvokableVoidFn = (...args: any[]) => void | Promise<void>
export type InvokableFn<T = void> = InvokableReturnFn<T> | InvokableVoidFn

export type Filtered<TType, TCondition> = {
  [TKey in keyof TType]: TType[TKey] extends TCondition ? TKey : never
}
export type AllowedKeys<TType, TCondition> = Filtered<TType, TCondition>[keyof TType]
export type Subset<TType, TCondition> = Pick<TType, AllowedKeys<TType, TCondition>>
export type InvokableFns<TInstance, TResult> = Subset<TInstance, InvokableFn<TResult>>
export type InstanceInvokableFn<TInstance, TResult> = keyof InvokableFns<TInstance, TResult>

export function isInjector(obj: any): obj is Injector {
  return obj && typeof obj.inject === 'function' && typeof obj.injectParam === 'function'
}

export interface Invoker {
  invoke<TInstance extends object, TResult>(
    instance: TInstance,
    methodName: InstanceInvokableFn<TInstance, TResult>,
    ...providers: Registerable[]
  ): Promise<TResult>
}

export interface TokenInjector {

  readonly context: InjectorContext

  inject<T>(token: InjectionToken<T>, ...providers: Registerable[]): Promise<InjectionResult<T>>
  inject<T>(token: InjectionToken<T>, optional: boolean, ...providers: Registerable[]): Promise<InjectionResult<T>>

  injectParam<T>(
    token: InjectionToken<T>,
    optional: boolean,
    providers: Registerable[],
    injectionContext: InjectionScope,
  ): Promise<T | T[]>

  createChild(scope: InjectionScope, providers?: Registerable[]): Injector
  createResolverContext<T>(token: InjectionToken<T>): ResolverContext<T>

}

export type Injector = Resolver & Invoker & TokenInjector
export interface RootInjector extends Injector {
  register(source: RegistrationSource, ...providers: Registerable[]): this
  init(...args: any[]): void
}

export const Injector = localToken.opinionated<Injector>('Injector', {
  multi: false,
  singleton: true,
})
