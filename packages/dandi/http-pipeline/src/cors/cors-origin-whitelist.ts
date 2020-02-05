import { InjectionToken } from '@dandi/core'
import { HttpHeaderWildcard } from '@dandi/http'

import { localOpinionatedToken } from '../local-token'

export type CorsOriginWhitelistEntry = string | RegExp
export type CorsOriginWhitelist = HttpHeaderWildcard | CorsOriginWhitelistEntry | CorsOriginWhitelistEntry[]

export const CorsOriginWhitelist: InjectionToken<CorsOriginWhitelist> =
  localOpinionatedToken<CorsOriginWhitelist>('CorsOriginWhitelist', {
    multi: false,
  })
