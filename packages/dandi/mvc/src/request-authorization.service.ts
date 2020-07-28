import { AuthorizationService } from './authorization.service'
import { localToken } from './local-token'

export const RequestAuthorizationService = localToken.opinionated<AuthorizationService>(
  'RequestAuthorizationService',
  {
    multi: false,
  },
)
