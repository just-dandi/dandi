import { Inject, Injectable, Injector, RestrictScope } from '@dandi/core'
import { HttpRequest, HttpRequestAcceptTypes, HttpRequestScope, MimeTypeInfo, parseMimeTypes } from '@dandi/http'
import { HttpPipelineResult, HttpPipelineRendererBase, Renderer, HttpPipelineRenderer } from '@dandi/http-pipeline'

import { HalMimeTypes } from './hal-mime-types'

@Injectable(RestrictScope(HttpRequestScope))
@Renderer(HalMimeTypes.halJson, HalMimeTypes.halXml, HalMimeTypes.halYaml)
export class HalObjectRenderer extends HttpPipelineRendererBase {

  public readonly defaultContentType: string = HalMimeTypes.halJson

  constructor(
    @Inject(Injector) private injector: Injector,
  ) {
    super()
  }

  public async renderPipelineResult(contentType: string): Promise<string> {
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
    return await this.injector.invoke(this as HalObjectRenderer, 'renderHalResult', ...providers)
  }

  public async renderHalResult(
    @Inject(HttpPipelineRenderer) renderer: HttpPipelineRenderer,
    @Inject(HttpRequestAcceptTypes) subRendererMimeType: MimeTypeInfo[],
    @Inject(HttpPipelineResult) pipelineResult: HttpPipelineResult,
  ): Promise<any> {
    const result = await renderer.render(subRendererMimeType, pipelineResult)
    return result.renderedBody
  }

}
