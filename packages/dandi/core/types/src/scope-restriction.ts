import { globalSymbol } from '../../src/global-symbol'

import { InjectionScope } from './injection-scope'

export interface ScopeBehaviorStatic {
  parent: ScopeBehavior
}

export interface ScopeBehavior {
  value: symbol
  (scope: InjectionScope): BehaviorScopeRestriction
}

export class BehaviorScopeRestriction {
  constructor(public readonly behavior: ScopeBehavior, public readonly scope: InjectionScope) {}
}

function scopeBehavior(desc: string): ScopeBehavior {
  const behaviorSymbol = globalSymbol(`ScopeBehavior.${desc}`)
  const behavior = Object.assign(function scopeRestriction(scope: InjectionScope) {
    return new BehaviorScopeRestriction(behavior, scope)
  }, {
    value: behaviorSymbol,
  })
  return behavior
}

export const ScopeBehavior: ScopeBehaviorStatic = {
  parent: scopeBehavior('parent'),
}

export type ScopeRestriction = InjectionScope | ScopeBehavior | BehaviorScopeRestriction
