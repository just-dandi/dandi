import { InjectionToken } from '@dandi/core'

import { AuthorizationService } from './authorization.service'
import { localOpinionatedToken } from './local.token'

export const RequestAuthorizationService: InjectionToken<AuthorizationService> = localOpinionatedToken<
  AuthorizationService
>('RequestAuthorizationService', {
  multi: false,
})
