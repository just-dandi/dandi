import { InjectionToken } from '@dandi/core'

import { localOpinionatedToken } from './local.token'

export interface AllowedAuthorization {
  allowed: true;
}
export interface DeniedAuthorization {
  allowed: false;
  reason: string;
}

export type AuthorizationCondition = AllowedAuthorization | DeniedAuthorization

export const AuthorizationCondition: InjectionToken<AuthorizationCondition> = localOpinionatedToken<
  AuthorizationCondition
>('AuthorizationCondition', {
  multi: true,
})
