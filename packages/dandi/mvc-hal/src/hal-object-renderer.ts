import { Disposable } from '@dandi/common'
import { Inject, Injector } from '@dandi/core'
import { HttpRequest, HttpRequestAcceptTypes, parseMimeTypes } from '@dandi/http'
import { ControllerResult, ObjectRendererBase, Renderer, MvcResponseRenderer } from '@dandi/mvc'

import { HalMimeTypes } from './hal-mime-types'

@Renderer(HalMimeTypes.halJson, HalMimeTypes.halXml, HalMimeTypes.halYaml)
export class HalObjectRenderer extends ObjectRendererBase {

  public readonly defaultContentType: string = HalMimeTypes.halJson

  constructor(
    @Inject(Injector) private injector: Injector,
  ) {
    super()
  }

  public async renderControllerResult(contentType: string, controllerResult: ControllerResult): Promise<string> {
    const halMimeType = parseMimeTypes(contentType)[0]
    const subRendererMimeType = parseMimeTypes(`${halMimeType.type}/${halMimeType.subtypeBase}`)
    const providers = [
      {
        provide: HttpRequest,
        useValue: {
          get: () => subRendererMimeType[0].fullType,
        },
      },
      {
        provide: HttpRequestAcceptTypes,
        useValue: subRendererMimeType,
      },
    ]

    return Disposable.useAsync(this.injector.inject(MvcResponseRenderer, ...providers), async resolveResult => {
      const renderer = resolveResult.singleValue
      const result = await renderer.render(subRendererMimeType, controllerResult)
      return result.renderedOutput

    })
  }

}
