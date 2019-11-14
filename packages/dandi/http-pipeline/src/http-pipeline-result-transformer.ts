import { InjectionToken } from '@dandi/core'

import { HttpPipelineResult } from './http-pipeline-result'
import { localOpinionatedToken } from './local-token'

export interface HttpPipelineResultTransformer {
  transform(result: HttpPipelineResult): Promise<HttpPipelineResult>
}

export const HttpPipelineResultTransformer: InjectionToken<HttpPipelineResultTransformer> = localOpinionatedToken(
  'HttpPipelineResultTransformer',
  {
    multi: true,
  },
)
