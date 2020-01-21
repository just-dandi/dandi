import { Constructor, getMetadata } from '@dandi/common'
import { ClassProvider, InjectionToken, Injector, Provider, RegistrationSource } from '@dandi/core'
import { Repository } from '@dandi/core/internal'
import { MimeTypeInfo, MimeType, parseMimeTypes } from '@dandi/http'

import { localOpinionatedToken } from '../local-token'
import { globalSymbol } from '../global.symbol'

import { HttpBodyParser } from './http-body-parser'

const META_KEY = globalSymbol('meta:http-')

export const BODY_PARSER_REGISTRATION_SOURCE: RegistrationSource = {
  constructor: BodyParser,
}

export interface BodyParserMetadata {
  contentTypes: MimeTypeInfo[]
}

export interface BodyParserInfo {
  constructor: Constructor<HttpBodyParser>
  metadata: BodyParserMetadata
}
export const BodyParserInfo: InjectionToken<BodyParserInfo[]> = localOpinionatedToken('BodyParserInfo', {
  multi: false,
})

export const BodyParserInfoProvider: Provider<BodyParserInfo[]> = {
  provide: BodyParserInfo,
  useFactory(injector: Injector) {
    const parserEntries = [...Repository.for(BodyParser).providers as IterableIterator<ClassProvider<HttpBodyParser>>]
      .filter(entry => injector.canResolve(entry.useClass))
    return parserEntries.map((entry: ClassProvider<HttpBodyParser>) => {
      return {
        constructor: entry.useClass,
        metadata: getBodyParserMetadata(entry.useClass),
      }
    })
  },
  deps: [
    Injector,
  ],
}

export function getBodyParserMetadata(target: Constructor<HttpBodyParser>): BodyParserMetadata {
  return getMetadata(META_KEY, () => ({ contentTypes: [] }), target)
}

export function bodyParserDecorator<T extends HttpBodyParser>(acceptTypes: string[], target: Constructor<T>): void {
  const meta = getBodyParserMetadata(target)
  meta.contentTypes = parseMimeTypes(...acceptTypes)
  Repository.for(BodyParser).register(BODY_PARSER_REGISTRATION_SOURCE, target)
}

export function BodyParser(...contentTypes: MimeType[]): ClassDecorator {
  return bodyParserDecorator.bind(null, contentTypes)
}
