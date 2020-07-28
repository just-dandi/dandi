import { Provider } from '@dandi/core'
import { HttpRequest } from '@dandi/http'

import { localToken } from './local-token'
import { Route } from './route'

export interface AuthProviderFactory {
  generateAuthProviders(route: Route, req: HttpRequest): Provider<any>[]
}

export const AuthProviderFactory = localToken.opinionated<AuthProviderFactory>('AuthProviderFactory', {
  multi: false,
})
