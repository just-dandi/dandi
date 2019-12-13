import { Disposable } from '@dandi/common'
import { Inject, Injector } from '@dandi/core'
import { HttpRequest, HttpRequestAcceptTypes, parseMimeTypes } from '@dandi/http'
import { HttpPipelineResult, HttpPipelineRendererBase, Renderer, HttpPipelineRenderer } from '@dandi/http-pipeline'

import { HalMimeTypes } from './hal-mime-types'

@Renderer(HalMimeTypes.halJson, HalMimeTypes.halXml, HalMimeTypes.halYaml)
export class HalObjectRenderer extends HttpPipelineRendererBase {

  public readonly defaultContentType: string = HalMimeTypes.halJson

  constructor(
    @Inject(Injector) private injector: Injector,
  ) {
    super()
  }

  public async renderPipelineResult(contentType: string, pipelineResult: HttpPipelineResult): Promise<string> {
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

    return Disposable.useAsync(this.injector.inject(HttpPipelineRenderer, ...providers), async resolveResult => {
      const renderer = resolveResult.singleValue
      const result = await renderer.render(subRendererMimeType, pipelineResult)
      return result.renderedBody

    })
  }

}
