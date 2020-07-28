import { Constructor, isConstructor } from '@dandi/common'

import { localToken } from '../../src/local-token'

import { InjectionToken } from './injection-token'
import { InstanceInvokableFn } from './injector'
import { FactoryProvider } from './provider'

/**
 * @internal
 * Stores a reference to the object (and for invocations, the method) that requested an injection dependency.
 */
export interface InvokeInjectionScope<TInstance = any, TResult = any> {
  instance: TInstance
  methodName: InstanceInvokableFn<TInstance, TResult>
}

/**
 * @internal
 */
export interface InvokeParamInjectionScope<TInstance = any, TResult = any>
  extends InvokeInjectionScope<TInstance, TResult> {
  paramName: string
}

/**
 * @internal
 */
export interface FactoryParamInjectionScope {
  target: FactoryProvider<any, any>
  paramToken: InjectionToken<any>
}

export class DependencyInjectionScope {
  public readonly value: string

  constructor(target: string)
  constructor(target: Constructor, ctrTag?: false)
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
      if (!this.methodName) {
        value += 'constructor '
      }
      value += this.target.name
    } else {
      value += this.target.constructor.name
      if (this.methodName !== false) {
        value += `.${this.methodName}`
      }
    }
    if (this.paramName) {
      value = `param '${this.paramName}' for ${value}`
    }
    return value
  }
}

export interface CustomInjectionScope {
  description: string
  type: string | symbol | Constructor
  instanceId?: any
}

export type InjectionScope =
  | Constructor
  | Function
  | string
  | CustomInjectionScope
  | DependencyInjectionScope
  | FactoryParamInjectionScope
  | InvokeInjectionScope
  | InvokeParamInjectionScope

export const InjectionScope: InjectionToken<InjectionScope> = localToken.opinionated<InjectionScope>(
  'InjectionScope',
  {
    multi: false,
    parentsOnly: true,
  },
)
