import { Disposable } from '@dandi/common'
import { Inject, Resolver, ResolverContext } from '@dandi/core'
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
    @Inject(Resolver) private resolver: Resolver,
    @Inject(ResolverContext) private resolverContext: ResolverContext<any>,
  ) {
    super()
  }

  protected async renderControllerResult(contentType: string, controllerResult: ControllerResult): Promise<string> {
    if (controllerResult instanceof ViewResult) {
      return controllerResult.value
    }
    return Disposable.useAsync(await this.resolver.resolveInContext(this.resolverContext, ViewResultFactory), async factoryResult => {
      const factory = factoryResult.singleValue
      const viewResult = await factory(undefined, controllerResult.data)
      return viewResult.value
    })
  }
}
