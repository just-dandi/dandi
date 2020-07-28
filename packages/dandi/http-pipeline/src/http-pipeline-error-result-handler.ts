import { HttpPipelineErrorResult } from '@dandi/http-pipeline'

import { localToken } from './local-token'

export interface HttpPipelineErrorResultHandler {
  handleError(result: HttpPipelineErrorResult): Promise<HttpPipelineErrorResult>
}

export const HttpPipelineErrorResultHandler = localToken.opinionated<HttpPipelineErrorResultHandler>(
  'HttpPipelineErrorResultHandler',
  {
    multi: true,
  },
)
