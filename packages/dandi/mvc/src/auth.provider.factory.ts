import { InjectionToken, Provider } from '@dandi/core'
import { HttpRequest } from '@dandi/http'

import { Route } from './route'
import { localOpinionatedToken } from './local.token'

export interface AuthProviderFactory {
  generateAuthProviders(route: Route, req: HttpRequest): Promise<Provider<any>[]>
}

export const AuthProviderFactory: InjectionToken<AuthProviderFactory> = localOpinionatedToken('AuthProviderFactory', {
  multi: false,
})
