import { InjectionToken, Provider } from '@dandi/core'
import { HttpRequest } from '@dandi/http'

import { localOpinionatedToken } from './local.token'
import { Route } from './route'

export interface AuthProviderFactory {
  generateAuthProviders(route: Route, req: HttpRequest): Provider<any>[]
}

export const AuthProviderFactory: InjectionToken<AuthProviderFactory> = localOpinionatedToken('AuthProviderFactory', {
  multi: false,
})
