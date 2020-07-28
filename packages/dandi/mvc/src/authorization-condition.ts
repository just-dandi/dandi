import { InjectionToken } from '@dandi/core'
import { HttpRequestScope } from '@dandi/http'

import { localToken } from './local-token'

export interface AllowedAuthorization {
  allowed: true
}
export interface DeniedAuthorization {
  allowed: false
  reason: string
}

export type AuthorizationCondition = AllowedAuthorization | DeniedAuthorization

export const AuthorizationCondition: InjectionToken<AuthorizationCondition> = localToken.opinionated<
  AuthorizationCondition
>('AuthorizationCondition', {
  multi: true,
  restrictScope: HttpRequestScope,
})
