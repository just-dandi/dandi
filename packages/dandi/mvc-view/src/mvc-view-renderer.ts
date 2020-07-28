import { AppError } from '@dandi/common'
import { Inject, Injectable, Injector, Optional, RestrictScope } from '@dandi/core'
import { HttpRequestScope, MimeType } from '@dandi/http'
import {
  HttpPipelineConfig,
  HttpPipelineErrorRendererDataFactory,
  HttpPipelineResult,
  HttpPipelineRendererBase,
  isHttpPipelineDataResult,
  Renderer,
} from '@dandi/http-pipeline'

import { ViewEngineConfig } from './view-engine-config'
import { isViewResult } from './view-result'
import { ViewResultFactory } from './view-result-factory'

@Injectable(RestrictScope(HttpRequestScope))
@Renderer(MimeType.textHtml, MimeType.textHtmlPartial)
export class MvcViewRenderer extends HttpPipelineRendererBase {
  protected readonly defaultContentType: string = MimeType.textHtml

  constructor(
    @Inject(Injector) private injector: Injector,
    @Inject(HttpPipelineConfig) private pipelineConfig: HttpPipelineConfig,
    @Inject(ViewEngineConfig) @Optional() private configs: any[],
  ) {
    super()

    if (!configs?.length) {
      throw new AppError('No view engines have been configured')
    }
  }

  protected async renderPipelineResult(contentType: string, pipelineResult: HttpPipelineResult): Promise<string> {
    if (isViewResult(pipelineResult)) {
      return pipelineResult.render()
    }

    const factory = await this.injector.inject(ViewResultFactory)
    const data = isHttpPipelineDataResult(pipelineResult)
      ? pipelineResult.data instanceof HttpPipelineErrorRendererDataFactory
        ? pipelineResult.data.getErrorRendererData(this.pipelineConfig.debugMode)
        : pipelineResult.data
      : {}
    const viewResult = await factory(undefined, data, pipelineResult.errors, pipelineResult.statusCode)
    return viewResult.render()
  }
}
