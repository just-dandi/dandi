import { InjectionToken, Provider } from '@dandi/core'

import { localOpinionatedToken } from './local.token'

// TODO: what are the use cases for this?
//  - appears to provide a method for globally configuring request-level providers, but why did I do this?
export interface RequestProviderRegistrar {
  provide(...args: any[]): Promise<Array<Provider<any>>>;
}

export const RequestProviderRegistrar: InjectionToken<RequestProviderRegistrar> = localOpinionatedToken<
  RequestProviderRegistrar
>('RequestProviderRegistrar', {
  multi: true,
})
