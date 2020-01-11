import { isConstructor } from '@dandi/common'
import { getRestrictedScope } from '@dandi/core/internal/util'
import {
  CustomInjectionScope,
  DependencyInjectionScope,
  FactoryParamInjectionScope,
  InjectionScope,
  InvokeInjectionScope,
  InvokeParamInjectionScope,
  Provider,
  ScopeRestriction,
} from '@dandi/core/types'

import { getTokenString, isInjectionToken } from './injection-token-util'
import { isClassProvider, isFactoryProvider, isValueProvider } from './provider-util'

export function getInjectionScope<T>(provider: Provider<T>): InjectionScope {
  if (isClassProvider(provider)) {
    return provider.useClass
  }
  if (isFactoryProvider(provider)) {
    if (provider.useFactory.name) {
      return provider.useFactory
    }
    return `FactoryProvider_${getTokenString(provider.provide)}`
  }
  if (isValueProvider(provider)) {
    return `ValueProvider_${getTokenString(provider.provide)}`
  }
}

export function isInvokeInjectionScope(obj: any): obj is InvokeInjectionScope {
  return obj && typeof obj.methodName === 'string' && typeof obj.instance === 'object'
}

export function isInvokeParamInjectionScope(obj: any): obj is InvokeParamInjectionScope {
  return obj && typeof obj.paramName === 'string' && isInvokeInjectionScope(obj)
}

export function getInjectionScopeName(source: ScopeRestriction): string {
  const scope = getRestrictedScope(source)
  if (!scope) {
    return undefined
  }
  switch (typeof scope) {
    case 'string': return scope
    case 'function': return scope.name
  }
  if (isInvokeInjectionScope(scope)) {
    return `${scope.instance.constructor.name}.${scope.methodName}`
  }
  if (isInvokeParamInjectionScope(scope)) {
    return `param '${scope.paramName}' for ${scope.instance.constructor.name}.${scope.methodName}`
  }
  if (isFactoryParamInjectionScope(scope)) {
    const provide = isConstructor(scope.target.provide) ? scope.target.provide.name : scope.target.provide.toString()
    const provider = ` via ${scope.target.useFactory.name}`
    return `factory param ${scope.paramToken.toString()} for provider ${provide}${provider}`
  }
  if (isCustomInjectionScope(scope)) {
    // TBD: include some representation of the instanceId, if present?
    return scope.description
  }
  return scope.toString()
}

export function getInjectionScopeVerb(scope: InjectionScope): string {
  if (isInvokeInjectionScope(scope) && !isInvokeParamInjectionScope(scope)) {
    return 'invoking'
  }
  return 'injecting'
}

export function isFactoryParamInjectionScope(obj: any): obj is FactoryParamInjectionScope {
  return obj && obj.target && isInjectionToken(obj.paramToken)
}

export function isCustomInjectionScope(obj: any): obj is CustomInjectionScope {
  return obj && typeof obj.description === 'string' && (
    typeof obj.type === 'string' ||
    typeof obj.type === 'symbol' ||
    isConstructor(obj)
  )
}

export function scopesAreCompatible(a: InjectionScope, b: InjectionScope): boolean {
  if (a === b) {
    return true
  }

  const aType = typeof a
  const bType = typeof b
  if (aType !== bType) {
    return false
  }

  if (isFactoryParamInjectionScope(a) && isFactoryParamInjectionScope(b)) {
    return a.target === b.target && a.paramToken === b.paramToken
  }

  if (isCustomInjectionScope(a) && isCustomInjectionScope(b)) {
    return a.type === b.type
  }

  const aScope = a as DependencyInjectionScope
  const bScope = b as DependencyInjectionScope

  return aScope.target === bScope.target &&
    aScope.methodName === bScope.methodName &&
    aScope.paramName === bScope.paramName
}
