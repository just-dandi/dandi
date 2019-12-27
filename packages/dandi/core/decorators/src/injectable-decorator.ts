import {
  isInjectableOption,
  isInjectionToken,
  InjectableRegistrationData,
  INJECTABLE_REGISTRATION_DATA,
} from '@dandi/core/internal/util'
import { InjectionToken, ProviderOptions, InjectionTokenTypeError, InjectableOption } from '@dandi/core/types'

export function Injectable<TInjectable>(
  injectableOrOption: InjectionToken<TInjectable> | InjectableOption = null,
  ...options: InjectableOption[]
): ClassDecorator {
  const injectable: InjectionToken<TInjectable> = isInjectableOption(injectableOrOption) ? null : injectableOrOption
  if (isInjectableOption(injectableOrOption)) {
    options.unshift(injectableOrOption)
  }
  return function injectableDecorator(target: any): void {
    const providerOptions: ProviderOptions<TInjectable> = {}
    if (injectable && !isInjectionToken(injectable)) {
      throw new InjectionTokenTypeError(injectable)
    }
    if (isInjectionToken(injectable)) {
      providerOptions.provide = injectable
    }
    options.forEach((option) => option.setOptions(providerOptions))
    INJECTABLE_REGISTRATION_DATA.push({ target, providerOptions })
    Reflect.set(target, ProviderOptions.valueOf() as symbol, providerOptions)
  }
}
Injectable[InjectableRegistrationData] = INJECTABLE_REGISTRATION_DATA

export const Singleton = new InjectableOption((options: ProviderOptions<any>) => (options.singleton = true))
export const NotSingleton = new InjectableOption((options: ProviderOptions<any>) => (options.singleton = false))
export const Multi = new InjectableOption((options: ProviderOptions<any>) => (options.multi = true))
export const NotMulti = new InjectableOption((options: ProviderOptions<any>) => (options.multi = false))
export const NoSelf = new InjectableOption((options: ProviderOptions<any>) => (options.noSelf = true))
