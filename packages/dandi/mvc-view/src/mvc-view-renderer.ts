import { Inject, Injectable, Injector, RestrictScope } from '@dandi/core'
import { HttpRequestScope, MimeType } from '@dandi/http'
import { HttpPipelineResult, HttpPipelineRendererBase, Renderer, isHttpPipelineDataResult } from '@dandi/http-pipeline'
import { ViewResult } from '@dandi/mvc-view'

import { ViewResultFactory } from './view-result-factory'

@Injectable(RestrictScope(HttpRequestScope))
@Renderer(MimeType.textHtml)
export class MvcViewRenderer extends HttpPipelineRendererBase {

  protected readonly defaultContentType: string = MimeType.textHtml

  constructor(
    @Inject(Injector) private injector: Injector,
  ) {
    super()
  }

  protected async renderPipelineResult(contentType: string, pipelineResult: HttpPipelineResult): Promise<string> {
    if (pipelineResult instanceof ViewResult) {
      return pipelineResult.value
    }

    const factoryResult = await this.injector.inject(ViewResultFactory)
    const factory = factoryResult.singleValue
    const viewResult = await factory(undefined, isHttpPipelineDataResult(pipelineResult) ? pipelineResult.data : {})
    return viewResult.value
  }
}
