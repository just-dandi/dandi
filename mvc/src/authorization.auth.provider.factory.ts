import { Inject, Injectable, Provider, Resolver } from '@dandi/core'

import { AuthProviderFactory } from './auth.provider.factory'
import { AuthorizationService } from './authorization.service'
import { AuthorizedUser, AuthorizedUserProvider } from './authorized.user'
import { UnauthorizedError } from './errors'
import { MvcRequest } from './mvc.request'
import { RequestAuthorizationService } from './request.authorization.service'
import { Route } from './route'

@Injectable(AuthProviderFactory)
export class AuthorizationAuthProviderFactory implements AuthProviderFactory {
  constructor(@Inject(Resolver) private resolver: Resolver) {}

  public async createAuthProviders(route: Route, req: MvcRequest): Promise<Array<Provider<any>>> {
    const authHeader = req.get('Authorization')

    if (!authHeader) {
      if (route.authorization) {
        throw new UnauthorizedError()
      }

      return [
        {
          provide: AuthorizedUser,
          useValue: null,
        },
      ]
    }

    const authSchemeEndIndex = authHeader.indexOf(' ')
    const authScheme = authHeader.substring(0, authSchemeEndIndex > 0 ? authSchemeEndIndex : undefined)
    const authServiceResult = await this.resolver.resolve(AuthorizationService(authScheme), !route.authorization)
    const result: Array<Provider<any>> = []
    if (authServiceResult) {
      result.push(
        {
          provide: RequestAuthorizationService,
          useValue: authServiceResult.singleValue,
        },
        AuthorizedUserProvider,
      )
    }

    if (Array.isArray(route.authorization) && route.authorization.length) {
      route.authorization.forEach((condition) => result.push(condition))
    }

    return result
  }
}
