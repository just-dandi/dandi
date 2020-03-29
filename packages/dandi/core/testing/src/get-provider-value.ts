import { AsyncFactoryProvider, Provider, ProviderTypeError } from '@dandi/core'
import { isClassProvider, isFactoryProvider, isValueProvider } from '@dandi/core/internal/util'

export function getProviderValue<TProvide>(provider: AsyncFactoryProvider<TProvide>, ...args: any[]): Promise<TProvide>
export function getProviderValue<TProvide>(provider: Provider<TProvide>, ...args: any[]): TProvide
export function getProviderValue<TProvide>(provider: Provider<TProvide>, ...args: any[]): TProvide | Promise<TProvide> {
  if (isValueProvider(provider)) {
    return provider.useValue
  }
  if (isFactoryProvider(provider)) {
    return provider.useFactory(...args)
  }
  if (isClassProvider(provider)) {
    return new provider.useClass(...args)
  }
  throw new ProviderTypeError(provider)
}
