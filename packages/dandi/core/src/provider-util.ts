import { isConstructor } from '@dandi/common'

import { isInjectionToken } from './injection-token'
import {
  AsyncFactoryProvider,
  ClassProvider,
  FactoryProvider,
  GeneratingProvider,
  Provider,
  ValueProvider,
} from './provider'

type Checker = (obj: any, hasInjectionToken: boolean) => boolean

function checkHasInjectionToken<T>(obj: any): obj is Provider<T> {
  return obj && isInjectionToken(obj.provide)
}

function checkAny(obj: any, hasInjectionToken: boolean, ...checks: Checker[]): boolean {
  if (hasInjectionToken === false) {
    return false
  }
  if (hasInjectionToken === null || hasInjectionToken === undefined) {
    if (!checkHasInjectionToken(obj)) {
      return false
    }
  }
  for (const checker of checks) {
    if (checker(obj, true)) {
      return true
    }
  }
  return false
}

function checkIsClassProvider<T>(obj: any, hasInjectionToken?: boolean): obj is ClassProvider<T> {
  return checkAny(obj, hasInjectionToken, () => isConstructor(obj.useClass))
}

function checkIsFactoryProvider<T>(obj: any, hasInjectionToken?: boolean): obj is FactoryProvider<T> {
  return checkAny(obj, hasInjectionToken, () => typeof obj.useFactory === 'function')
}

function checkIsGeneratingProvider<T>(obj: any, hasInjectionToken?: boolean): obj is GeneratingProvider<T> {
  return checkAny(obj, hasInjectionToken, checkIsClassProvider, checkIsFactoryProvider)
}

function checkIsValueProvider<T>(obj: any, hasInjectionToken?: boolean): obj is ValueProvider<T> {
  return checkAny(obj, hasInjectionToken, () => obj.useValue !== undefined)
}

export function isProvider<T>(obj: any): obj is Provider<T> {
  return checkAny(obj, checkHasInjectionToken(obj), checkIsClassProvider, checkIsFactoryProvider, checkIsValueProvider)
}

export function isClassProvider<T>(obj: any): obj is ClassProvider<T> {
  return checkIsClassProvider(obj)
}

export function isFactoryProvider<T>(obj: any): obj is FactoryProvider<T> {
  return checkIsFactoryProvider(obj)
}

export function isAsyncFactoryProvider<T>(obj: any): obj is AsyncFactoryProvider<T> {
  return checkIsFactoryProvider(obj) && obj.async
}

export function isGeneratingProvider<T>(obj: any): obj is GeneratingProvider<T> {
  return checkIsGeneratingProvider(obj)
}

export function isValueProvider<T>(obj: any): obj is ValueProvider<T> {
  return checkIsValueProvider(obj)
}
