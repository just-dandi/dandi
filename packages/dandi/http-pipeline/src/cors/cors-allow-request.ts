import { InjectionToken } from '@dandi/core'
import { HttpRequestScope } from '@dandi/http'

import { localOpinionatedToken } from '../local-token'

export const CorsAllowRequest: InjectionToken<boolean> = localOpinionatedToken<boolean>('CorsAllowRequest', {
  multi: false,
  restrictScope: HttpRequestScope,
})
