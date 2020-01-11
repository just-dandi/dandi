import { Injectable, Provider, Injector } from '@dandi/core'
import { HttpRequest, UnauthorizedError } from '@dandi/http'
import { HttpPipelinePreparer } from '@dandi/http-pipeline'

import { AuthProviderFactory } from './auth-provider.factory'
import { AuthorizationService } from './authorization.service'
import { AuthorizedUserProvider } from './authorized.user'
import { RequestAuthorizationService } from './request-authorization.service'
import { Route } from './route'

@Injectable(AuthProviderFactory)
@HttpPipelinePreparer()
export class AuthorizationAuthProviderFactory implements AuthProviderFactory {

  public generateAuthProviders(route: Route, req: HttpRequest): Provider<any>[] {
    const authHeader = req.get('Authorization')

    if (!authHeader) {
      if (route.authorization) {
        throw new UnauthorizedError()
      }

      return []
    }

    const authSchemeEndIndex = authHeader.indexOf(' ')
    const authScheme = authHeader.substring(0, authSchemeEndIndex > 0 ? authSchemeEndIndex : undefined)
    async function authServiceResultFactory(injector: Injector): Promise<any> {
      return (await injector.inject(AuthorizationService(authScheme), !route.authorization))?.singleValue
    }
    const providers: Provider<any>[] = [
      {
        provide: RequestAuthorizationService,
        useFactory: authServiceResultFactory,
        deps: [
          Injector,
        ],
      },
      AuthorizedUserProvider,
    ]

    if (Array.isArray(route.authorization) && route.authorization.length) {
      providers.push(...route.authorization)
    }

    return providers
  }
}
