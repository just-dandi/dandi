import { Disposable } from '@dandi/common'
import { Inject, Injector, InjectorContext, ResolverContext } from '@dandi/core'
import { MimeTypes } from '@dandi/http'
import { HttpPipelineResult, HttpResponseRendererBase, Renderer } from '@dandi/http-pipeline'
import { ViewResult } from '@dandi/mvc-view'

import { ViewResultFactory } from './view-result-factory'

@Renderer(MimeTypes.textHtml)
export class MvcViewRenderer extends HttpResponseRendererBase {

  protected readonly defaultContentType: string = MimeTypes.textHtml

  constructor(
    @Inject(Injector) private injector: Injector,
    @Inject(InjectorContext) private injectorContext: ResolverContext<any>,
  ) {
    super()
  }

  protected async renderPipelineResult(contentType: string, pipelineResult: HttpPipelineResult): Promise<string> {
    if (pipelineResult instanceof ViewResult) {
      return pipelineResult.value
    }
    return Disposable.useAsync(this.injector.inject(ViewResultFactory, this.injectorContext), async factoryResult => {
      const factory = factoryResult.singleValue
      const viewResult = await factory(undefined, pipelineResult.data)
      return viewResult.value
    })
  }
}
