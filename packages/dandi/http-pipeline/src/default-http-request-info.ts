import { Uuid } from '@dandi/common'
import { Provider } from '@dandi/core'

import { HttpRequestInfo } from './http-request-info'
import { NoopPerformanceLogger } from './noop-performance-logger'

export const DefaultHttpRequestInfo: Provider<HttpRequestInfo> = {
  provide: HttpRequestInfo,
  useFactory() {
    return {
      requestId: Uuid.create(),
      performance: new NoopPerformanceLogger(),
    }
  },
}
