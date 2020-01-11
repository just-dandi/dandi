import { Inject, Injectable, Injector, RestrictScope } from '@dandi/core'
import { HttpRequestScope, MimeTypes } from '@dandi/http'
import { HttpPipelineResult, HttpPipelineRendererBase, Renderer } from '@dandi/http-pipeline'
import { ViewResult } from '@dandi/mvc-view'

import { ViewResultFactory } from './view-result-factory'

@Injectable(RestrictScope(HttpRequestScope))
@Renderer(MimeTypes.textHtml)
export class MvcViewRenderer extends HttpPipelineRendererBase {

  protected readonly defaultContentType: string = MimeTypes.textHtml

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
    const viewResult = await factory(undefined, pipelineResult.data)
    return viewResult.value
  }
}
