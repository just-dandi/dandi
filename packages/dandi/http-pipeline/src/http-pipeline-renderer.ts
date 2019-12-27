import { Constructor } from '@dandi/common'
import { InjectionToken, Provider, Injector } from '@dandi/core'
import {
  isRenderableMimeType,
  MimeTypeInfo,
  HttpHeaders,
  HttpRequest,
  HttpRequestAcceptTypes,
  HttpStatusCode,
} from '@dandi/http'

import { localOpinionatedToken } from './local-token'
import { HttpPipelineResult } from './http-pipeline-result'
import { RendererInfo, RendererInfoProvider, RendererMetadata } from './renderer-decorator'

export interface HttpPipelineRendererResult {
  headers?: HttpHeaders
  statusCode?: HttpStatusCode
  renderedBody: string
  contentType: string
}
export const HttpPipelineRendererResult = localOpinionatedToken('HttpPipelineRendererResult', {
  multi: false,
})

export interface HttpPipelineRenderer {
  readonly renderableTypes: MimeTypeInfo[]
  render(acceptTypes: MimeTypeInfo[], pipelineResult: HttpPipelineResult): HttpPipelineRendererResult | Promise<HttpPipelineRendererResult>
}
export const HttpPipelineRenderer: InjectionToken<HttpPipelineRenderer> = localOpinionatedToken('HttpPipelineRenderer', {
  multi: false,
  singleton: false,
})
export const DefaultHttpPipelineRenderer: InjectionToken<Constructor<HttpPipelineRenderer>> = localOpinionatedToken('DefaultHttpPipelineRenderer', {
  multi: false,
  singleton: false,
})
export type DefaultHttpPipelineRendererProviders = [Constructor<HttpPipelineRenderer>, Provider<Constructor<HttpPipelineRenderer>>]
export function defaultHttpPipelineRenderer(rendererType: Constructor<HttpPipelineRenderer>): DefaultHttpPipelineRendererProviders {
  return [
    rendererType,
    {
      provide: DefaultHttpPipelineRenderer,
      useValue: rendererType,
    },
  ]
}

type HttpPipelineRendererCache = Map<string, Constructor<HttpPipelineRenderer>>
const HttpPipelineRendererCache: InjectionToken<HttpPipelineRendererCache> = localOpinionatedToken('HttpPipelineRendererCache', {
  multi: false,
  singleton: true,
})

const HttpPipelineRendererCacheProvider: Provider<HttpPipelineRendererCache> = {
  provide: HttpPipelineRendererCache,
  useFactory: () => new Map<string, Constructor<HttpPipelineRenderer>>(),
}

export function isSupportingRenderer(renderer: RendererMetadata, acceptType: MimeTypeInfo): boolean {
  return !!renderer.acceptTypes.find(isRenderableMimeType.bind(null, acceptType))
}

export function selectRenderer(acceptTypes: MimeTypeInfo[], renderers: RendererInfo[]): Constructor<HttpPipelineRenderer> {
  for (const acceptType of acceptTypes) {
    for (const renderer of renderers) {
      if (isSupportingRenderer(renderer.metadata, acceptType)) {
        return renderer.constructor
      }
    }
  }
}

const SelectedRenderer: InjectionToken<Constructor<HttpPipelineRenderer>> = localOpinionatedToken('SelectedRenderer', {
  multi: false,
  singleton: false,
})
const SelectedRendererProvider: Provider<Constructor<HttpPipelineRenderer>> = {
  provide: SelectedRenderer,
  useFactory(
    req: HttpRequest,
    acceptTypes: HttpRequestAcceptTypes,
    renderers: RendererInfo[],
    defaultRenderer: Constructor<HttpPipelineRenderer>,
    cache: HttpPipelineRendererCache,
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
    DefaultHttpPipelineRenderer,
    HttpPipelineRendererCache,
  ],
  providers: [
    RendererInfoProvider,
    HttpPipelineRendererCacheProvider,
  ],
}

export const HttpPipelineRendererProvider: Provider<HttpPipelineRenderer> = {
  provide: HttpPipelineRenderer,
  async useFactory(
    injector: Injector,
    SelectedRenderer: Constructor<HttpPipelineRenderer>,
  ): Promise<HttpPipelineRenderer> {
    const resolveResult = await injector.inject(SelectedRenderer)
    return resolveResult.singleValue
  },
  async: true,
  deps: [
    Injector,
    SelectedRenderer,
  ],
  providers: [
    SelectedRendererProvider,
  ],
}
