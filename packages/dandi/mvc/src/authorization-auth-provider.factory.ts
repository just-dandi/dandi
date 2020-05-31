import { Injectable, InjectionToken, Injector, Provider } from '@dandi/core'
import {
  HttpHeader,
  HttpMethod,
  HttpRequest,
  HttpRequestHeadersAccessor,
  HttpRequestScope,
  UnauthorizedError,
} from '@dandi/http'
import { HttpPipelinePreparer } from '@dandi/http-pipeline'

import { AuthProviderFactory } from './auth-provider.factory'
import { AuthorizationService } from './authorization.service'
import { AuthorizedUserProvider } from './authorized.user'
import { localOpinionatedToken } from './local.token'
import { RequestAuthorizationService } from './request-authorization.service'
import { Route } from './route'

export const AuthorizationScheme: InjectionToken<string> = localOpinionatedToken<string>('AuthorizationScheme', {
  multi: false,
  restrictScope: HttpRequestScope,
})

function authorizationSchemeFactory(headers: HttpRequestHeadersAccessor, route: Route): string {
  const authHeader = headers.get(HttpHeader.authorization)
  if (!authHeader && route.authorization) {
    throw new UnauthorizedError()
  }
  const authSchemeEndIndex = authHeader.indexOf(' ')
  return authHeader.substring(0, authSchemeEndIndex > 0 ? authSchemeEndIndex : undefined)
}

export const AuthorizationSchemeProvider: Provider<string> = {
  provide: AuthorizationScheme,
  useFactory: authorizationSchemeFactory,
  deps: [HttpRequestHeadersAccessor, Route],
}

@Injectable(AuthProviderFactory)
@HttpPipelinePreparer()
export class AuthorizationAuthProviderFactory implements AuthProviderFactory {

  public generateAuthProviders(route: Route, req: HttpRequest): Provider<any>[] {

    if (req.method === HttpMethod.options) {
      return []
    }

    async function authServiceResultFactory(authScheme: string, injector: Injector): Promise<AuthorizationService> {
      return (await injector.inject(AuthorizationService(authScheme), !route.authorization))?.singleValue
    }
    const providers: Provider<any>[] = [
      {
        provide: RequestAuthorizationService,
        useFactory: authServiceResultFactory,
        restrictScope: HttpRequestScope,
        deps: [
          AuthorizationScheme,
          Injector,
        ],
      },
      AuthorizedUserProvider,
      AuthorizationSchemeProvider,
    ]

    if (Array.isArray(route.authorization) && route.authorization.length) {
      providers.push(...route.authorization)
    }

    return providers
  }
}
