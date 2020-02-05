import { Inject, Injectable } from '@dandi/core'

import { HttpPipelineResult } from '../http-pipeline-result'

import { CorsHeaderValues } from './cors-headers'

@Injectable()
export class CorsHandler {

  public async handleOptionsRequest(
    @Inject(CorsHeaderValues) corsHeaders: CorsHeaderValues,
  ): Promise<HttpPipelineResult> {
    return {
      void: true,
      headers: corsHeaders,
    }
  }

}
