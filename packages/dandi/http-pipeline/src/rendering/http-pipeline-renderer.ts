import { Constructor } from '@dandi/common'
import { InjectionToken, Provider, Injector, ScopeBehavior } from '@dandi/core'
import {
  mimeTypesAreCompatible,
  MimeTypeInfo,
  HttpHeader,
  HttpHeaders,
  HttpRequest,
  HttpRequestAcceptTypes,
  HttpRequestHeadersAccessor,
  HttpRequestScope,
  HttpStatusCode,
  mimeTypesAreIdentical,
} from '@dandi/http'

import { HttpPipelineResult } from '../http-pipeline-result'
import { localToken } from '../local-token'

import { HttpPipelineRendererFactoryError } from './http-pipeline-renderer-factory-error'
import { RendererInfo, RendererInfoProvider, RendererMetadata } from './renderer-decorator'

export interface HttpPipelineRendererResult {
  headers?: HttpHeaders
  statusCode?: HttpStatusCode
  renderedBody: string
  contentType: string
}
export const HttpPipelineRendererResult: InjectionToken<HttpPipelineRendererResult> = localToken.opinionated<
  HttpPipelineRendererResult
>('HttpPipelineRendererResult', {
  multi: false,
  restrictScope: HttpRequestScope,
})

export interface HttpPipelineRenderer {
  readonly renderableTypes: MimeTypeInfo[]
  render(
    acceptTypes: MimeTypeInfo[],
    pipelineResult: HttpPipelineResult,
  ): HttpPipelineRendererResult | Promise<HttpPipelineRendererResult>
}
export const HttpPipelineRenderer = localToken.opinionated<HttpPipelineRenderer>('HttpPipelineRenderer', {
  multi: false,
  restrictScope: ScopeBehavior.perInjector(HttpRequestScope),
})
export const DefaultHttpPipelineRenderer = localToken.opinionated<Constructor<HttpPipelineRenderer>>(
  'DefaultHttpPipelineRenderer',
  {
    multi: false,
  },
)
export type DefaultHttpPipelineRendererProviders = [
  Constructor<HttpPipelineRenderer>,
  Provider<Constructor<HttpPipelineRenderer>>,
]
export function defaultHttpPipelineRenderer(
  rendererType: Constructor<HttpPipelineRenderer>,
): DefaultHttpPipelineRendererProviders {
  return [
    rendererType,
    {
      provide: DefaultHttpPipelineRenderer,
      useValue: rendererType,
    },
  ]
}

type HttpPipelineRendererCache = Map<string, Constructor<HttpPipelineRenderer>[]>
const HttpPipelineRendererCache: InjectionToken<HttpPipelineRendererCache> = localToken.opinionated<
  HttpPipelineRendererCache
>('HttpPipelineRendererCache', {
  multi: false,
})

const HttpPipelineRendererCacheProvider: Provider<HttpPipelineRendererCache> = {
  provide: HttpPipelineRendererCache,
  useFactory: () => new Map<string, Constructor<HttpPipelineRenderer>[]>(),
}

export function isSupportingRenderer(renderer: RendererMetadata, acceptType: MimeTypeInfo): boolean {
  return !!renderer.acceptTypes.find(mimeTypesAreCompatible.bind(null, acceptType))
}

export function selectRenderers(
  acceptTypes: MimeTypeInfo[],
  renderers: RendererInfo[],
): Constructor<HttpPipelineRenderer>[] {
  const results = new Set<Constructor<HttpPipelineRenderer>>()
  for (const acceptType of acceptTypes) {
    const isIdenticalMimeType = mimeTypesAreIdentical.bind(undefined, acceptType)
    const supported = renderers
      .filter((renderer) => !results.has(renderer.constructor) && isSupportingRenderer(renderer.metadata, acceptType))
      .sort((a, b): number => {
        // prefer renderers that support a type directly, over those that only work via wildcard accept
        const aHasDirect = a.metadata.acceptTypes.some(isIdenticalMimeType)
        const bHasDirect = b.metadata.acceptTypes.some(isIdenticalMimeType)
        if (aHasDirect && bHasDirect) {
          return 0
        }
        if (aHasDirect) {
          return -1
        }
        if (bHasDirect) {
          return 1
        }
        return 0
      })
    for (const renderer of supported) {
      results.add(renderer.constructor)
    }
  }
  return [...results]
}

const CompatibleRenderers: InjectionToken<Constructor<HttpPipelineRenderer>[]> = localToken.opinionated(
  'SelectedRenderer',
  {
    multi: false,
    restrictScope: ScopeBehavior.perInjector(HttpRequestScope),
  },
)
const CompatibleRenderersProvider: Provider<Constructor<HttpPipelineRenderer>[]> = {
  provide: CompatibleRenderers,
  useFactory(
    req: HttpRequest,
    headers: HttpRequestHeadersAccessor,
    acceptTypes: HttpRequestAcceptTypes,
    renderers: RendererInfo[],
    defaultRenderer: Constructor<HttpPipelineRenderer>,
    cache: HttpPipelineRendererCache,
  ) {
    const accept = headers.get(HttpHeader.accept)
    const cacheKey = `${req.path}_${accept}`

    let compatibleRenderers = cache.get(cacheKey)
    if (compatibleRenderers) {
      return compatibleRenderers
    }

    compatibleRenderers = selectRenderers(acceptTypes, renderers)
    if (compatibleRenderers?.length) {
      cache.set(cacheKey, compatibleRenderers)
      return compatibleRenderers
    }

    cache.set(cacheKey, [defaultRenderer])
    return [defaultRenderer]
  },
  deps: [
    HttpRequest,
    HttpRequestHeadersAccessor,
    HttpRequestAcceptTypes,
    RendererInfo,
    DefaultHttpPipelineRenderer,
    HttpPipelineRendererCache,
  ],
  providers: [RendererInfoProvider, HttpPipelineRendererCacheProvider],
}

export const HttpPipelineRendererProvider: Provider<HttpPipelineRenderer> = {
  provide: HttpPipelineRenderer,
  async useFactory(
    injector: Injector,
    compatibleRenderers: Constructor<HttpPipelineRenderer>[],
  ): Promise<HttpPipelineRenderer> {
    const errors: Error[] = []
    for (const SelectedRenderer of compatibleRenderers) {
      try {
        const resolveResult = await injector.inject(SelectedRenderer)
        return resolveResult.singleValue
      } catch (err) {
        errors.push(err)
      }
    }
    if (errors.length) {
      throw new HttpPipelineRendererFactoryError(
        'Compatible renderers are configured, but none of them could render without error',
        errors,
      )
    }
    throw new HttpPipelineRendererFactoryError('No compatible renderers are configured')
  },
  async: true,
  deps: [Injector, CompatibleRenderers],
  providers: [CompatibleRenderersProvider],
}
