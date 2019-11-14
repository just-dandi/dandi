import { InjectionToken, Provider } from '@dandi/core'
import { HttpRequest } from '@dandi/http'

import { AuthorizationService } from './authorization.service'
import { localOpinionatedToken } from './local.token'
import { RequestAuthorizationService } from './request.authorization.service'
import { RequestInfo } from './request.info'

export interface AuthorizedUser {
  uid: string;
}

export const AuthorizedUser: InjectionToken<AuthorizedUser> = localOpinionatedToken<AuthorizedUser>('AuthorizedUser', {
  multi: false,
})

export async function authorizedUserFactory(
  authService: AuthorizationService,
  req: HttpRequest,
  requestInfo: RequestInfo,
): Promise<AuthorizedUser> {
  requestInfo.performance.mark('authorizedUserFactory', 'beforeGetAuthorizedUser')
  const result = await authService.getAuthorizedUser(req.get('Authorization'))
  requestInfo.performance.mark('authorizedUserFactory', 'afterGetAuthorizedUser')

  return result
}

export const AuthorizedUserProvider: Provider<AuthorizedUser> = {
  provide: AuthorizedUser,
  useFactory: authorizedUserFactory,
  async: true,
  deps: [RequestAuthorizationService, HttpRequest, RequestInfo],
  singleton: true,
}
