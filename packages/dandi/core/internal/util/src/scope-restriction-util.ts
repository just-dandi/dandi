import {
  BehaviorScopeRestriction,
  InjectionScope,
  InjectionToken,
  OpinionatedToken,
  Provider,
  ScopeBehavior,
  ScopeRestriction,
} from '@dandi/core/types'

import { globalSymbol } from '../../../src/global-symbol'

import { isInjectionToken } from './injection-token-util'

const behaviorSymbolBase = globalSymbol('ScopeBehavior').toString()
const behaviorSymbolPrefix = behaviorSymbolBase.substring(0, behaviorSymbolBase.length - 1)

/**
 * @internal
 * Returns `true` if {@param obj} is a {@link ScopeBehavior}; otherwise. `false`
 */
export function isScopeBehavior(obj: any): obj is ScopeBehavior {
  return typeof obj === 'function' &&
    typeof obj.value === 'symbol' &&
    obj.value.toString().startsWith(behaviorSymbolPrefix)
}

/**
 * @internal
 * Returns the {@link ScopeBehavior} of the provided {@param restriction} if it has one; otherwise, `undefined`.
 */
export function getScopeBehavior(restriction: ScopeRestriction): ScopeBehavior {
  return isScopeBehavior(restriction) ?
    restriction :
    (restriction instanceof BehaviorScopeRestriction) ?
      restriction.behavior :
      undefined
}

/**
 * @internal
 * Returns the value of {@link InjectionOptions.restrictScope} for the specified {@link Provider} or
 * {@link InjectionToken}, or `undefined` if there is no scope restriction.
 *
 * Scope restrictions on an {@link InjectionToken} take precedence over those set on a {@link Provider}.
 */
export function getScopeRestriction(obj: Provider<any> | InjectionToken<any>): ScopeRestriction {
  if (isInjectionToken(obj)) {
    return obj instanceof OpinionatedToken && obj.options?.restrictScope || undefined
  }

  return getScopeRestriction(obj.provide) || obj.restrictScope || undefined
}

/**
 * @internal
 * Returns the {@link InjectionScope} specified by a {@link ScopeRestriction}, if one is specified; otherwise,
 * `undefined`.
 */
export function getRestrictedScope(restriction: ScopeRestriction): InjectionScope {
  return restriction instanceof BehaviorScopeRestriction ?
    restriction.scope :
    isScopeBehavior(restriction) ?
      undefined :
      restriction
}
