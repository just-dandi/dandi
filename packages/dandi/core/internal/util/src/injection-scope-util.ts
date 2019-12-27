import { InjectionScope, InvokeInjectionScope, InvokeParamInjectionScope, Provider } from '@dandi/core/types'

import { getTokenString } from './injection-token-util'
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

export function getInjectionScopeName(scope: InjectionScope): string {
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
    return `param ${scope.paramName} for ${scope.instance.constructor.name}.${scope.methodName}`
  }
  return scope.toString()
}

export function getInjectionScopeVerb(scope: InjectionScope): string {
  if (isInvokeInjectionScope(scope) && !isInvokeParamInjectionScope(scope)) {
    return 'invoking'
  }
  return 'injecting'
}
