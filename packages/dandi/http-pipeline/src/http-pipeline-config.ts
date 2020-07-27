import { Constructor } from '@dandi/common'
import { LogLevel } from '@dandi/core'

import { HttpPipelinePreparer } from './http-pipeline-preparer'
import { HttpPipelineResultTransformer } from './http-pipeline-result-transformer'
import { localToken } from './local-token'

// FIXME: define conditions for inclusion
//        does that belong here or only in MVC? provide an abstraction to allow filtering?
//        use controller decorators for path-specific before/after?
export interface HttpPipelineConfig {
  before?: Constructor<HttpPipelinePreparer>[]
  after?: Constructor<HttpPipelineResultTransformer>[]
  debugMode?: boolean
  logHandledErrors?: boolean | LogLevel
}

export const HttpPipelineConfig = localToken.opinionated<HttpPipelineConfig>('HttpPipelineConfig', {
  multi: false,
})
