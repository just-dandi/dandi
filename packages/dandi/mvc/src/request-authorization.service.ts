import { InjectionToken } from '@dandi/core'

import { AuthorizationService } from './authorization.service'
import { localToken } from './local-token'

export const RequestAuthorizationService: InjectionToken<AuthorizationService> = localToken.opinionated<
  AuthorizationService
>('RequestAuthorizationService', {
  multi: false,
})
