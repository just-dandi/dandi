import { Uuid } from '@dandi/common'
import { HttpRequestScope } from '@dandi/http'

import { localToken } from './local-token'
import { PerformanceLogger } from './performance-logger'

// TODO: this needs a better name, and probably a better defined purpose.
//  Split perf into its own injectable? RequestId too?
export interface HttpRequestInfo {
  requestId: Uuid
  performance: PerformanceLogger
}

export const HttpRequestInfo = localToken.opinionated<HttpRequestInfo>('HttpRequestInfo', {
  multi: false,
  restrictScope: HttpRequestScope,
})
