import { Constructor } from '@dandi/common'
import { InjectionToken, Provider } from '@dandi/core'
import { createStubInstance } from 'sinon'

export function stubProvider<TService extends TToken, TToken = TService>(
  service: Constructor<TService>,
  token?: InjectionToken<TToken>,
): Provider<TToken> {
  return {
    provide: token || service,
    useFactory: () => createStubInstance(service) as any,
    singleton: true,
  }
}

export function stubValueProvider<TToken>(
  token: InjectionToken<TToken> | Constructor<TToken>,
  useFactory: () => TToken,
): Provider<TToken> {
  return {
    provide: token,
    useFactory,
  }
}
