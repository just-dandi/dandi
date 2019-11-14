import { Uuid } from '@dandi/common'
import { InjectionToken } from '@dandi/core'

import { localOpinionatedToken } from './local-token'
import { PerformanceLogger } from './performance-logger'

export interface HttpRequestInfo {
  requestId: Uuid
  performance: PerformanceLogger
}

export const HttpRequestInfo: InjectionToken<HttpRequestInfo> = localOpinionatedToken<HttpRequestInfo>('HttpRequestInfo', {
  multi: false,
})
