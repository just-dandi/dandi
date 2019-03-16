import { InjectionContext, MethodInjectionContext, DependencyInjectionContext } from './injection-context'
import { getTokenString } from './injection-token'
import { Provider } from './provider'
import { isClassProvider, isFactoryProvider, isValueProvider } from './provider-util'

/**
 * @internal
 * Returns an [[InjectionContext]] object for the given `provider`
 * @param provider The [[Provider]] whose dependency is being resolved
 */
export function getInjectionContext<T>(provider: Provider<T>): InjectionContext {
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

/**
 * Returns `true` if `obj` is a valid [[MethodInjectionContext]]; otherwise, `false`
 * @param obj The object to check
 */
export function isMethodInjectionContext(obj: any): obj is MethodInjectionContext {
  return obj && typeof obj.methodName === 'string' && typeof obj.instance === 'object'
}

export function getInjectionContextName(context: InjectionContext): string {
  if (context instanceof DependencyInjectionContext) {
    return context.toString()
  }
  if (isMethodInjectionContext(context)) {
    return `${context.instance.constructor.name}.${context.methodName}`
  }
  if (typeof context === 'string') {
    return context
  }
  return context && context.name
}
