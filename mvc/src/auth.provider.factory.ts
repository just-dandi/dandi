import { InjectionToken, Provider } from '@dandi/core';
import { MvcRequest, Route } from '@dandi/mvc';

import { localOpinionatedToken } from './local.token';

export interface AuthProviderFactory {
  createAuthProviders(route: Route, req: MvcRequest): Promise<Array<Provider<any>>>;
}

export const AuthProviderFactory: InjectionToken<AuthProviderFactory> = localOpinionatedToken('AuthProviderFactory', {
  multi: false,
});
