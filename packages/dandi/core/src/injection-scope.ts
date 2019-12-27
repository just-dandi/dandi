import { Constructor, isConstructor } from '@dandi/common'

import { InjectionToken } from './injection-token'
import { InstanceInvokableFn } from './injector'
import { localOpinionatedToken } from './local-token'

/**
 * Stores a reference to the object (and for invocations, the method) that requested an injection dependency.
 */
export interface InvokeInjectionScope<TInstance = any, TResult = any> {
  instance: TInstance,
  methodName: InstanceInvokableFn<TInstance, TResult>,
}

export interface InvokeParamInjectionScope<TInstance = any, TResult = any> extends InvokeInjectionScope<TInstance, TResult> {
  paramName: string
}
export class DependencyInjectionScope {

  public readonly value: string

  constructor(target: string)
  constructor(target: Constructor, ctrTag?: false)
  constructor(target: object, methodName: string)
  constructor(target: object, methodName: string, paramName: string)
  constructor(
    public readonly target: Constructor | object | string,
    public readonly methodName?: string | false,
    public readonly paramName?: string,
  ) {
    Object.assign(this, { target, methodName, paramName, value: this.getValue() })
  }

  public toString(): string {
    return this.value
  }

  public getValue(): string {
    if (typeof this.target === 'string') {
      return this.target
    }

    let value = ''
    if (isConstructor(this.target)) {
      value += this.target.name
      if (this.methodName !== false) {
        value += '.ctr'
      }
    } else {
      value += this.target.constructor.name
      if (this.methodName !== false) {
        value += `.${this.methodName}`
      }
    }
    if (this.paramName) {
      value = `param ${this.paramName} for ${value}`
    }
    return value
  }

}

export type InjectionScope = Constructor | Function | InvokeInjectionScope | InvokeParamInjectionScope | string | DependencyInjectionScope

export const InjectionScope: InjectionToken<InjectionScope> = localOpinionatedToken<InjectionScope>(
  'InjectionScope',
  {
    multi: false,
    singleton: false,
    parentsOnly: true,
  },
)

/**
 * Represents the root-level injection scope. This is generally only used directly for app initialization, and
 * as the parent of {@link AppInjectionScope}
 */
export const RootInjectionScope = new class RootInjectionScope extends DependencyInjectionScope {

  private static readonly value = '[RootInjector]'

  constructor() {
    super(RootInjectionScope)
  }

  public getValue(): string {
    return RootInjectionScope.value
  }
}()

export const AppInjectionScope = new class AppInjectionScope extends DependencyInjectionScope {

  private static readonly value = '[AppInjector]'

  constructor() {
    super(AppInjectionScope)
  }

  public getValue(): string {
    return AppInjectionScope.value
  }
}()
