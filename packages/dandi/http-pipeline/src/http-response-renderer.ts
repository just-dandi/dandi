import { Constructor } from '@dandi/common'
import { InjectionToken, Provider, Injector, InjectorContext, ResolverContext } from '@dandi/core'
import { isRenderableMimeType, MimeTypeInfo, HttpRequest, HttpRequestAcceptTypes } from '@dandi/http'

import { localOpinionatedToken } from './local-token'
import { DefaultHttpResponseRenderer } from './default-http-response-renderer'
import { HttpPipelineResult } from './http-pipeline-result'
import { RendererInfo, RendererInfoProvider, RendererMetadata } from './renderer-decorator'

export interface HttpResponseRendererResult {
  renderedOutput: string
  contentType: string
}
export interface HttpResponseRenderer {
  readonly renderableTypes: MimeTypeInfo[]
  render(acceptTypes: MimeTypeInfo[], pipelineResult: HttpPipelineResult): HttpResponseRendererResult | Promise<HttpResponseRendererResult>
}
export const HttpResponseRenderer: InjectionToken<HttpResponseRenderer> = localOpinionatedToken('HttpResponseRenderer', {
  multi: false,
  singleton: false,
})

type ResponseRendererCache = Map<string, Constructor<HttpResponseRenderer>>
const ResponseRendererCache: InjectionToken<ResponseRendererCache> = localOpinionatedToken('ResponseRendererCache', {
  multi: false,
  singleton: true,
})

const ResponseRendererCacheProvider: Provider<ResponseRendererCache> = {
  provide: ResponseRendererCache,
  useFactory: () => new Map<string, Constructor<HttpResponseRenderer>>(),
}

export function isSupportingRenderer(renderer: RendererMetadata, acceptType: MimeTypeInfo): boolean {
  return !!renderer.acceptTypes.find(isRenderableMimeType.bind(null, acceptType))
}

export function selectRenderer(acceptTypes: MimeTypeInfo[], renderers: RendererInfo[]): Constructor<HttpResponseRenderer> {
  for (const acceptType of acceptTypes) {
    for (const renderer of renderers) {
      if (isSupportingRenderer(renderer.metadata, acceptType)) {
        return renderer.constructor
      }
    }
  }
}

const SelectedRenderer: InjectionToken<Constructor<HttpResponseRenderer>> = localOpinionatedToken('SelectedRenderer', {
  multi: false,
  singleton: false,
})
const SelectedRendererProvider: Provider<Constructor<HttpResponseRenderer>> = {
  provide: SelectedRenderer,
  useFactory(
    req: HttpRequest,
    acceptTypes: HttpRequestAcceptTypes,
    renderers: RendererInfo[],
    defaultRenderer: Constructor<HttpResponseRenderer>,
    cache: ResponseRendererCache,
  ) {

    const accept = req.get('Accept')
    const cacheKey = `${req.path}_${accept}`

    let renderer = cache.get(cacheKey)
    if (renderer) {
      return renderer
    }

    renderer = selectRenderer(acceptTypes, renderers)
    if (renderer) {
      cache.set(cacheKey, renderer)
      return renderer
    }

    cache.set(cacheKey, defaultRenderer)
    return defaultRenderer
  },
  deps: [
    HttpRequest,
    HttpRequestAcceptTypes,
    RendererInfo,
    DefaultHttpResponseRenderer,
    ResponseRendererCache,
  ],
  providers: [
    RendererInfoProvider,
    ResponseRendererCacheProvider,
  ],
}

export const HttpResponseRendererProvider: Provider<HttpResponseRenderer> = {
  provide: HttpResponseRenderer,
  async useFactory(
    injector: Injector,
    injectorContext: ResolverContext<HttpResponseRenderer>,
    SelectedRenderer: Constructor<HttpResponseRenderer>,
  ): Promise<HttpResponseRenderer> {
    const resolveResult = await injector.inject(SelectedRenderer, injectorContext)
    return resolveResult.singleValue
  },
  async: true,
  deps: [
    Injector,
    InjectorContext,
    SelectedRenderer,
  ],
  providers: [
    SelectedRendererProvider,
  ],
}
