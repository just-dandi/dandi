import { Constructor, isConstructor } from '@dandi/common'

import { localToken } from '../../src/local-token'

import { InjectionToken } from './injection-token'
import { InstanceInvokableFn } from './injector'

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

export const InjectionScope: InjectionToken<InjectionScope> = localToken.opinionated<InjectionScope>(
  'InjectionScope',
  {
    multi: false,
    singleton: false,
    parentsOnly: true,
  },
)
