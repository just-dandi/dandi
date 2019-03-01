import { Disposable } from '@dandi/common'
import { Inject, Repository, Resolver } from '@dandi/core'
import {
  ControllerResult,
  ObjectRendererBase,
  parseMimeTypes,
  Renderer,
  MvcRequest, RequestAcceptTypes, MvcResponseRenderer,
} from '@dandi/mvc'

import { HalMimeTypes } from './hal-mime-types'

@Renderer(HalMimeTypes.halJson, HalMimeTypes.halXml, HalMimeTypes.halYaml)
export class HalObjectRenderer extends ObjectRendererBase {

  public readonly defaultContentType: string = HalMimeTypes.halJson

  constructor(
    @Inject(Resolver) private resolver: Resolver,
  ) {
    super()
  }

  public async renderControllerResult(contentType: string, controllerResult: ControllerResult): Promise<string> {
    const halMimeType = parseMimeTypes(contentType)[0]
    const subRendererMimeType = parseMimeTypes(`${halMimeType.type}/${halMimeType.subtypeBase}`)
    return Disposable.useAsync(Repository.for(controllerResult), async (repo) => {
      repo.registerProviders(
        {
          provide: MvcRequest,
          useValue: {
            get: () => subRendererMimeType[0].fullType,
          },
        },
        {
          provide: RequestAcceptTypes,
          useValue: subRendererMimeType,
        },
      )

      return Disposable.useAsync(await this.resolver.resolve(MvcResponseRenderer, false, repo), async resolveResult => {
        const renderer = resolveResult.singleValue
        const result = await renderer.render(subRendererMimeType, controllerResult)
        return result.renderedOutput

      })
    })
  }

}
