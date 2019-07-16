import { Disposable } from '@dandi/common'
import { Inject, Injector, InjectorContext, ResolverContext } from '@dandi/core'
import {
  ControllerResult,
  MimeTypes,
  ObjectRendererBase,
  Renderer,
} from '@dandi/mvc'
import { ViewResult } from '@dandi/mvc-view'

import { ViewResultFactory } from './view-result-factory'

@Renderer(MimeTypes.textHtml)
export class MvcViewRenderer extends ObjectRendererBase {

  protected readonly defaultContentType: string = MimeTypes.textHtml

  constructor(
    @Inject(Injector) private injector: Injector,
    @Inject(InjectorContext) private injectorContext: ResolverContext<any>,
  ) {
    super()
  }

  protected async renderControllerResult(contentType: string, controllerResult: ControllerResult): Promise<string> {
    if (controllerResult instanceof ViewResult) {
      return controllerResult.value
    }
    return Disposable.useAsync(this.injector.inject(ViewResultFactory, this.injectorContext), async factoryResult => {
      const factory = factoryResult.singleValue
      const viewResult = await factory(undefined, controllerResult.data)
      return viewResult.value
    })
  }
}
