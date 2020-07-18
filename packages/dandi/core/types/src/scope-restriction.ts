import { AppInjectionScope, RootInjectionScope } from '../../internal/src/root-injection-scope'
import { globalSymbol } from '../../src/global-symbol'

import { InjectionScope } from './injection-scope'

export interface ScopeBehaviorStatic {
  perInjector: ScopeBehavior
}

export interface ScopeBehavior {
  value: symbol
  (scope: InjectionScope): BehaviorScopeRestriction
}

export class BehaviorScopeRestriction {
  constructor(public readonly behavior: ScopeBehavior, public readonly scope: InjectionScope) {}
}

const behaviors = new Map<symbol, ScopeBehavior>()

function scopeBehavior(desc: string): ScopeBehavior {
  const behaviorSymbol = globalSymbol(`ScopeBehavior.${desc}`)
  const existingBehavior = behaviors.get(behaviorSymbol)
  if (existingBehavior) {
    return existingBehavior
  }
  const restrictions = new Map<InjectionScope, BehaviorScopeRestriction>()
  const behavior = Object.assign(
    function scopeRestriction(scope: InjectionScope) {
      const existingRestriction = restrictions.get(scope)
      if (existingRestriction) {
        return existingRestriction
      }
      const restriction = new BehaviorScopeRestriction(behavior, scope)
      restrictions.set(scope, restriction)
      return restriction
    },
    {
      value: behaviorSymbol,
    },
  )
  behaviors.set(behaviorSymbol, behavior)
  return behavior
}

export const ScopeBehavior: ScopeBehaviorStatic = {
  /**
   * A behavior that forces injectable instances to be instantiated once for each injector that requests them, instead
   * of just once at the registration site.
   */
  perInjector: scopeBehavior('perInjector'),
}
export interface ScopeRestrictionStatic {
  /**
   * A behavior that restricts an injectable to only being instantiated at the app injector
   */
  app: BehaviorScopeRestriction

  /**
   * A behavior that restricts an injectable to only being instantiated at the root injector
   */
  root: BehaviorScopeRestriction
}

export type ScopeRestriction = InjectionScope | ScopeBehavior | BehaviorScopeRestriction

export const ScopeRestriction: ScopeRestrictionStatic = {
  /**
   * A behavior that restricts an injectable to only being instantiated at the app injector
   */
  app: scopeBehavior('app')(AppInjectionScope),

  /**
   * A behavior that restricts an injectable to only being instantiated at the root injector
   */
  root: scopeBehavior('root')(RootInjectionScope),
}
