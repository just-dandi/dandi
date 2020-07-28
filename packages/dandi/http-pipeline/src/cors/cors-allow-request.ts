import { HttpRequestScope } from '@dandi/http'

import { localToken } from '../local-token'

export const CorsAllowRequest = localToken.opinionated<boolean>('CorsAllowRequest', {
  multi: false,
  restrictScope: HttpRequestScope,
})
