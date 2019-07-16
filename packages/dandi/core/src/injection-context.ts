import { Constructor, isConstructor } from '@dandi/common'

import { InjectionToken } from './injection-token'
import { localOpinionatedToken } from './local-token'
import { InstanceInvokableFn } from './injector'

/**
 * Stores a reference to the object (and for invocations, the method) that requested an injection dependency.
 */
export interface MethodInjectionContext<TInstance = any, TResult = any> {
  instance: TInstance,
  methodName: InstanceInvokableFn<TInstance, TResult>,
}

export class DependencyInjectionContext {

  public readonly value: string

  constructor(target: string)
  constructor(target: Constructor, ctrTag?: false)
  constructor(target: object, methodName: string)
  constructor(target: object, methodName: string, paramName: string)
  constructor(
    public readonly target: Constructor | object | string,
    public readonly methodName?: string | false,
  ) {
    if (typeof this.target === 'string') {
      this.value = this.target
    } else {
      this.value = ''
      if (isConstructor(this.target)) {
        this.value += this.target.name
        if (this.methodName !== false) {
          this.value += '.ctr'
        }
      } else {
        this.value += this.target.constructor.name
        if (this.methodName !== false) {
          this.value += `.${this.methodName}`
        }
      }

    }
  }

  public toString(): string {
    return this.value
  }

}

export type InjectionContext = Constructor<any> | Function | MethodInjectionContext | string | DependencyInjectionContext

export const InjectionContext: InjectionToken<InjectionContext> = localOpinionatedToken<InjectionContext>(
  'InjectionContext',
  {
    multi: false,
    singleton: false,
    parentsOnly: true,
  },
)

export const RootInjectionContext = new class RootInjectionContext extends DependencyInjectionContext {
  constructor() {
    super(RootInjectionContext, false)
  }
}()

export const AppInjectionContext = new class AppInjectionContext extends DependencyInjectionContext {
  constructor() {
    super('Application')
  }
}()
