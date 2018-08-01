import { InjectionToken, Provider } from '@dandi/core';

import { AuthorizationService } from './authorization.service';
import { localOpinionatedToken } from './local.token';
import { MvcRequest } from './mvc.request';
import { RequestAuthorizationService } from './request.authorization.service';
import { RequestInfo } from './request.info';

export interface AuthorizedUser {
  uid: string;
}

export const AuthorizedUser: InjectionToken<AuthorizedUser> = localOpinionatedToken<AuthorizedUser>('AuthorizedUser', {
  multi: false,
});

export async function authorizedUserFactory(
  authService: AuthorizationService,
  req: MvcRequest,
  requestInfo: RequestInfo,
): Promise<AuthorizedUser> {
  requestInfo.performance.mark('authorizedUserFactory', 'beforeGetAuthorizedUser');
  const result = await authService.getAuthorizedUser(req.get('Authorization'));
  requestInfo.performance.mark('authorizedUserFactory', 'afterGetAuthorizedUser');

  return result;
}

export const AuthorizedUserProvider: Provider<AuthorizedUser> = {
  provide: AuthorizedUser,
  useFactory: authorizedUserFactory,
  async: true,
  deps: [RequestAuthorizationService, MvcRequest, RequestInfo],
  singleton: true,
};
