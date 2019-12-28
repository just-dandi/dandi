import { Constructor } from '@dandi/common'
import { InjectionToken, Provider, Injector } from '@dandi/core'
import {
  HttpRequestHeaders,
  HttpRequest,
  mimeTypesAreCompatible,
  MimeTypeInfo,
  parseMimeTypes,
} from '@dandi/http'

import { localOpinionatedToken } from '../local-token'

import { BodyParserInfo, BodyParserInfoProvider, BodyParserMetadata } from './body-parser-decorator'

export interface HttpBodyParser {
  readonly parseableTypes: MimeTypeInfo[]
  parseBody(body: string | Buffer, headers: HttpRequestHeaders): string | object | Promise<object>
}
export const HttpBodyParser: InjectionToken<HttpBodyParser> = localOpinionatedToken('HttpBodyParser', {
  multi: false,
  singleton: false,
})

type HttpBodyParserCache = Map<string, Constructor<HttpBodyParser>>
const HttpBodyParserCache: InjectionToken<HttpBodyParserCache> = localOpinionatedToken('HttpBodyParserCache', {
  multi: false,
  singleton: true,
})

const HttpBodyParserCacheProvider: Provider<HttpBodyParserCache> = {
  provide: HttpBodyParserCache,
  useFactory: () => new Map<string, Constructor<HttpBodyParser>>(),
}

export function isSupportingBodyParser(bodyParser: BodyParserMetadata, contentType: MimeTypeInfo): boolean {
  return !!bodyParser.contentTypes.find(mimeTypesAreCompatible.bind(null, contentType))
}

export function selectBodyParser(contentType: MimeTypeInfo, bodyParsers: BodyParserInfo[]): Constructor<HttpBodyParser> {
  for (const bodyParser of bodyParsers) {
    if (isSupportingBodyParser(bodyParser.metadata, contentType)) {
      return bodyParser.constructor
    }
  }
}

const SelectedBodyParser: InjectionToken<Constructor<HttpBodyParser>> = localOpinionatedToken('SelectedBodyParser', {
  multi: false,
  singleton: false,
})
const SelectedBodyParserProvider: Provider<Constructor<HttpBodyParser>> = {
  provide: SelectedBodyParser,
  useFactory(
    req: HttpRequest,
    bodyParsers: BodyParserInfo[],
    cache: HttpBodyParserCache,
  ) {

    const [rawContentType] = req.get('Content-Type').split(';')
    const [contentType] = parseMimeTypes(rawContentType)
    const cacheKey = `${req.path}_${contentType}`

    let bodyParser = cache.get(cacheKey)
    if (bodyParser) {
      return bodyParser
    }

    bodyParser = selectBodyParser(contentType, bodyParsers)
    if (bodyParser) {
      cache.set(cacheKey, bodyParser)
      return bodyParser
    }

  },
  deps: [
    HttpRequest,
    BodyParserInfo,
    HttpBodyParserCache,
  ],
  providers: [
    BodyParserInfoProvider,
    HttpBodyParserCacheProvider,
  ],
}

export const HttpBodyParserProvider: Provider<HttpBodyParser> = {
  provide: HttpBodyParser,
  async useFactory(
    injector: Injector,
    SelectedBodyParser: Constructor<HttpBodyParser>,
  ): Promise<HttpBodyParser> {
    const resolveResult = await injector.inject(SelectedBodyParser)
    return resolveResult.singleValue
  },
  async: true,
  deps: [
    Injector,
    SelectedBodyParser,
  ],
  providers: [
    SelectedBodyParserProvider,
  ],
}
