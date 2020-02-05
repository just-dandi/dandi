import { HttpResponseHeader } from '@dandi/http'

import { CorsAllowOriginFn } from './cors'
import { CorsOriginWhitelist } from './cors-origin-whitelist'

export interface CorsConfig {
  allowCredentials?: true
  allowHeaders?: HttpResponseHeader[]
  allowOrigin?: CorsOriginWhitelist | CorsAllowOriginFn
  exposeHeaders?: HttpResponseHeader[]
  maxAge?: number
}
