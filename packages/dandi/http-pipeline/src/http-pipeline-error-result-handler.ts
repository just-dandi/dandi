import { InjectionToken } from '@dandi/core'
import { HttpPipelineErrorResult } from '@dandi/http-pipeline'

import { localToken } from './local-token'

export interface HttpPipelineErrorResultHandler {
  handleError(result: HttpPipelineErrorResult): Promise<HttpPipelineErrorResult>
}

export const HttpPipelineErrorResultHandler: InjectionToken<HttpPipelineErrorResultHandler> = localToken.opinionated(
  'HttpPipelineErrorResultHandler',
  {
    multi: true,
  },
)
