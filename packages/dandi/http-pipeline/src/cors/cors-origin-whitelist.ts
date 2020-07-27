import { InjectionToken } from '@dandi/core'
import { HttpHeaderWildcard } from '@dandi/http'

import { localToken } from '../local-token'

export type CorsOriginWhitelistEntry = string | RegExp
export type CorsOriginWhitelist = HttpHeaderWildcard | CorsOriginWhitelistEntry | CorsOriginWhitelistEntry[]

export const CorsOriginWhitelist: InjectionToken<CorsOriginWhitelist> = localToken.opinionated<CorsOriginWhitelist>(
  'CorsOriginWhitelist',
  {
    multi: false,
  },
)
