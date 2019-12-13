import { InjectionToken } from '@dandi/core'
import { HttpPipelineErrorResult } from '@dandi/http-pipeline'

import { localOpinionatedToken } from './local-token'

export interface HttpPipelineErrorResultHandler {
  handleError(result: HttpPipelineErrorResult): Promise<HttpPipelineErrorResult>
}

export const HttpPipelineErrorResultHandler: InjectionToken<HttpPipelineErrorResultHandler> = localOpinionatedToken(
  'HttpPipelineErrorResultHandler',
  {
    multi: true,
  },
)
