import { InjectionToken, Provider } from '@dandi/core'

import { MvcRequest } from './mvc.request'
import { Route } from './route'
import { localOpinionatedToken } from './local.token'

export interface AuthProviderFactory {
  generateAuthProviders(route: Route, req: MvcRequest): Promise<Provider<any>[]>
}

export const AuthProviderFactory: InjectionToken<AuthProviderFactory> = localOpinionatedToken('AuthProviderFactory', {
  multi: false,
})
