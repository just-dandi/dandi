import { localToken } from '../../src/local-token'

import { InjectionResult } from './injection-result'
import { InjectionScope } from './injection-scope'
import { InjectionToken } from './injection-token'
import { InjectorContext } from './injector-context'
import { Provider } from './provider'
import { Registerable } from './registerable'
import { RegistrationSource } from './registration-source'

export type ResolvedProvider<T> = Provider<T> | Set<Provider<T>>

export interface Resolver {
  /**
   * Performs a shallow check (not checking dependencies or other parameters) to see if a matching provider
   * has been configured for the specified injection token.
   * @param token - the injection token
   */
  canResolve(token: InjectionToken<any>): boolean

  resolve<T>(token: InjectionToken<T>, optional?: boolean): ResolvedProvider<T>
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
  readonly parent: Injector
  readonly context: InjectorContext

  inject<T>(token: InjectionToken<T>, optional?: boolean): Promise<InjectionResult<T>>

  createChild(scope: InjectionScope, providers?: Registerable[]): Injector
}

export type Injector = Resolver & Invoker & TokenInjector
export interface RootInjector extends Injector {
  register(source: RegistrationSource, ...providers: Registerable[]): this
  init(...args: any[]): void
}

export const Injector = localToken.opinionated<Injector>('Injector', {
  multi: false,
})
