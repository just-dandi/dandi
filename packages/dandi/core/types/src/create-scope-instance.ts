import { CustomInjectionScope } from './injection-scope'

export type ScopeInstanceData<TScope extends CustomInjectionScope, TScopeInstance extends TScope> = Omit<
  TScopeInstance,
  keyof TScope
>

export interface ScopeInstanceFactory<TScope extends CustomInjectionScope, TScopeInstance extends TScope> {
  (instanceData: ScopeInstanceData<TScope, TScopeInstance>): TScopeInstance
}

export function scopeInstanceFactory<TScope extends CustomInjectionScope, TScopeInstance extends TScope>(
  scope: TScope,
): ScopeInstanceFactory<TScope, TScopeInstance> {
  return function createScopeInstance(instanceData: ScopeInstanceData<TScope, TScopeInstance>): TScopeInstance {
    const props = Object.entries(instanceData).reduce((result, [key, value]) => {
      result[key] = {
        value,
        configurable: false,
        enumerable: true,
        writable: false,
      }
      return result
    }, {} as PropertyDescriptorMap)
    return Object.create(scope, props)
  }
}
