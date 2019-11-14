import { Inject, Injectable, Provider, Injector } from '@dandi/core'
import { HttpRequest, UnauthorizedError } from '@dandi/http'

import { AuthProviderFactory } from './auth-provider.factory'
import { AuthorizationService } from './authorization.service'
import { AuthorizedUser, AuthorizedUserProvider } from './authorized.user'
import { RequestAuthorizationService } from './request-authorization.service'
import { Route } from './route'

@Injectable(AuthProviderFactory)
export class AuthorizationAuthProviderFactory implements AuthProviderFactory {
  constructor(@Inject(Injector) private injector: Injector) {}

  public async generateAuthProviders(route: Route, req: HttpRequest): Promise<Provider<any>[]> {
    const authHeader = req.get('Authorization')

    if (!authHeader) {
      if (route.authorization) {
        throw new UnauthorizedError()
      }

      return [{
        provide: AuthorizedUser,
        useValue: null,
      }]
    }

    const authSchemeEndIndex = authHeader.indexOf(' ')
    const authScheme = authHeader.substring(0, authSchemeEndIndex > 0 ? authSchemeEndIndex : undefined)
    const authServiceResult = await this.injector.inject(AuthorizationService(authScheme), !route.authorization)
    const providers: Provider<any>[] = []
    if (authServiceResult) {
      providers.push(
        {
          provide: RequestAuthorizationService,
          useValue: authServiceResult.singleValue,
        },
        AuthorizedUserProvider,
      )
    }

    if (Array.isArray(route.authorization) && route.authorization.length) {
      providers.push(...route.authorization)
    }

    return providers
  }
}
