import { Inject } from '@dandi/core'
import { HttpRequest, HttpRequestHeadersAccessor } from '@dandi/http'

import { HttpPipelinePreparer, HttpPipelinePreparerResult } from '../http-pipeline-preparer'

import { CorsAllowRequest } from './cors-allow-request'
import { CorsHeaderValues } from './cors-headers'
import { isCorsRequest, corsRequestAllowed } from './cors-util'

@HttpPipelinePreparer()
export class CorsPreparer implements HttpPipelinePreparer {
  constructor(@Inject(CorsHeaderValues) private corsHeaders: CorsHeaderValues) {}

  public async prepare(req: HttpRequest): Promise<HttpPipelinePreparerResult> {
    if (isCorsRequest(req)) {
      return [
        {
          provide: CorsAllowRequest,
          useFactory: corsRequestAllowed,
          deps: [CorsHeaderValues, HttpRequestHeadersAccessor],
        },
      ]
    }

    return [
      {
        provide: CorsAllowRequest,
        useValue: true,
      },
    ]
  }
}
