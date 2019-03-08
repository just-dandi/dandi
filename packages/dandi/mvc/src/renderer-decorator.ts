import { Constructor, getMetadata } from '@dandi/common'
import {
  ClassProvider,
  InjectionToken,
  Provider,
  Repository,
  RepositoryRegistrationSource, Injector,
} from '@dandi/core'

import { localOpinionatedToken } from './local.token'
import { globalSymbol } from './global.symbol'
import { parseMimeTypes } from './mime-type'
import { MimeTypeInfo } from './mime-type-info'
import { ObjectRenderer } from './object-renderer'

const META_KEY = globalSymbol('meta:renderer')

export const RENDERER_REGISTRATION_SOURCE: RepositoryRegistrationSource = {
  constructor: Renderer,
}

export interface RendererMetadata {
  acceptTypes: MimeTypeInfo[]
}

export interface RendererInfo {
  constructor: Constructor<ObjectRenderer>
  metadata: RendererMetadata
}
export const RendererInfo: InjectionToken<RendererInfo[]> = localOpinionatedToken('RendererInfo', {
  multi: false,
  singleton: true,
})

export const RendererInfoProvider: Provider<RendererInfo[]> = {
  provide: RendererInfo,
  useFactory(injector: Injector) {
    const rendererEntries = [...Repository.for(Renderer).entries() as IterableIterator<ClassProvider<ObjectRenderer>>]
      .filter(entry => injector.canResolve(entry.useClass))
    return rendererEntries.map((entry: ClassProvider<ObjectRenderer>) => {
      return {
        constructor: entry.useClass,
        metadata: getRendererMetadata(entry.useClass),
      }
    })
  },
  deps: [
    Injector,
  ],
}

export function getRendererMetadata(target: Constructor<ObjectRenderer>): RendererMetadata {
  return getMetadata(META_KEY, () => ({ acceptTypes: [] }), target)
}

export function rendererDecorator<T extends ObjectRenderer>(acceptTypes: string[], target: Constructor<T>): void {
  // injectableDecorator(undefined, [], target)
  const meta = getRendererMetadata(target)
  meta.acceptTypes = parseMimeTypes(...acceptTypes)
  Repository.for(Renderer).register(RENDERER_REGISTRATION_SOURCE, target)
}

export function Renderer(...acceptTypes: string[]): ClassDecorator {
  return rendererDecorator.bind(null, acceptTypes)
}
