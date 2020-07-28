import { InjectionToken, Provider } from '@dandi/core'
import { HttpRequest, HttpRequestScope } from '@dandi/http'
import { HttpRequestInfo } from '@dandi/http-pipeline'

import { AuthorizationService } from './authorization.service'
import { localToken } from './local-token'
import { RequestAuthorizationService } from './request-authorization.service'

export interface AuthorizedUser {
  uid: string
}

export const AuthorizedUser: InjectionToken<AuthorizedUser> = localToken.opinionated<AuthorizedUser>(
  'AuthorizedUser',
  {
    multi: false,
    restrictScope: HttpRequestScope,
  },
)

export async function authorizedUserFactory(
  authService: AuthorizationService,
  req: HttpRequest,
  requestInfo: HttpRequestInfo,
): Promise<AuthorizedUser> {
  requestInfo.performance.mark('authorizedUserFactory', 'beforeGetAuthorizedUser')
  if (!authService) {
    return undefined
  }
  const result = await authService.getAuthorizedUser(req.get('Authorization'))
  requestInfo.performance.mark('authorizedUserFactory', 'afterGetAuthorizedUser')

  return result
}

export const AuthorizedUserProvider: Provider<AuthorizedUser> = {
  provide: AuthorizedUser,
  useFactory: authorizedUserFactory,
  async: true,
  deps: [RequestAuthorizationService, HttpRequest, HttpRequestInfo],
}
