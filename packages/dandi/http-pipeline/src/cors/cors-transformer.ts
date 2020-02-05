import { Inject, Injectable, RestrictScope } from '@dandi/core'
import { HttpRequest, HttpRequestScope } from '@dandi/http'

import { HttpPipelineResult } from '../http-pipeline-result'
import { HttpPipelineResultTransformer } from '../http-pipeline-result-transformer'

import { CorsHeaderValues } from './cors-headers'
import { isCorsRequest } from './cors-util'

@Injectable(HttpPipelineResultTransformer, RestrictScope(HttpRequestScope))
export class CorsTransformer implements HttpPipelineResultTransformer {

  constructor(
    @Inject(HttpRequest) private req: HttpRequest,
    @Inject(CorsHeaderValues) private corsHeaders: CorsHeaderValues,
  ) {}

  public async transform(result: HttpPipelineResult): Promise<HttpPipelineResult> {
    if (isCorsRequest(this.req)) {
      return Object.assign({}, result, {
        headers: Object.assign({}, result.headers || {}, this.corsHeaders),
      })
    }
    return result
  }

}
