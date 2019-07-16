import { Constructor } from '@dandi/common'
import { InjectionToken, Provider, Injector, InjectorContext, ResolverContext } from '@dandi/core'

import { localOpinionatedToken } from './local.token'
import { isRenderableMimeType } from './mime-type'
import { MimeTypeInfo } from './mime-type-info'
import { MvcRequest } from './mvc.request'
import { DefaultObjectRenderer, ObjectRenderer } from './object-renderer'
import { RendererInfo, RendererInfoProvider, RendererMetadata } from './renderer-decorator'
import { RequestAcceptTypes } from './request-accept-types'
import { Route } from './route'

export const MvcResponseRenderer: InjectionToken<ObjectRenderer> = localOpinionatedToken('MvcResponseRenderer', {
  multi: false,
  singleton: false,
})

type RouteRendererCache = Map<string, Constructor<ObjectRenderer>>
const RouteRendererCache: InjectionToken<RouteRendererCache> = localOpinionatedToken('RouteRendererCache', {
  multi: false,
  singleton: true,
})

const RouteRendererCacheProvider: Provider<RouteRendererCache> = {
  provide: RouteRendererCache,
  useFactory: () => new Map<string, Constructor<ObjectRenderer>>(),
}

export function isSupportingRenderer(renderer: RendererMetadata, acceptType: MimeTypeInfo): boolean {
  return !!renderer.acceptTypes.find(isRenderableMimeType.bind(null, acceptType))
}

export function selectRenderer(acceptTypes: MimeTypeInfo[], renderers: RendererInfo[]): Constructor<ObjectRenderer> {
  for (const acceptType of acceptTypes) {
    for (const renderer of renderers) {
      if (isSupportingRenderer(renderer.metadata, acceptType)) {
        return renderer.constructor
      }
    }
  }
}

const SelectedRenderer: InjectionToken<Constructor<ObjectRenderer>> = localOpinionatedToken('SelectedRenderer', {
  multi: false,
  singleton: false,
})
const SelectedRendererProvider: Provider<Constructor<ObjectRenderer>> = {
  provide: SelectedRenderer,
  useFactory(
    req: MvcRequest,
    acceptTypes: RequestAcceptTypes,
    route: Route,
    renderers: RendererInfo[],
    defaultRenderer: Constructor<ObjectRenderer>,
    cache: RouteRendererCache,
  ) {

    const accept = req.get('Accept')
    const cacheKey = `${route.path}_${accept}`

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
    MvcRequest,
    RequestAcceptTypes,
    Route,
    RendererInfo,
    DefaultObjectRenderer,
    RouteRendererCache,
  ],
  providers: [
    RendererInfoProvider,
    RouteRendererCacheProvider,
  ],
}

export const MvcResponseRendererProvider: Provider<ObjectRenderer> = {
  provide: MvcResponseRenderer,
  async useFactory(
    injector: Injector,
    injectorContext: ResolverContext<ObjectRenderer>,
    SelectedRenderer: Constructor<ObjectRenderer>,
  ): Promise<ObjectRenderer> {
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
