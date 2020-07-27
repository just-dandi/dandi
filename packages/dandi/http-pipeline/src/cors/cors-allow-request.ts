import { InjectionToken } from '@dandi/core'
import { HttpRequestScope } from '@dandi/http'

import { localToken } from '../local-token'

export const CorsAllowRequest: InjectionToken<boolean> = localToken.opinionated<boolean>('CorsAllowRequest', {
  multi: false,
  restrictScope: HttpRequestScope,
})
