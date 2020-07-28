import { Constructor } from '@dandi/common'
import { Injector, Provider, ScopeBehavior } from '@dandi/core'
import {
  HttpContentType,
  HttpHeader,
  HttpRequest,
  HttpRequestHeadersAccessor,
  HttpRequestScope,
  MimeType,
  MimeTypeInfo,
  mimeTypesAreCompatible,
  parseMimeTypes,
} from '@dandi/http'

import { localToken } from '../local-token'

import { BodyParserInfo, BodyParserMetadata } from './body-parser-decorator'

export interface HttpBodyParser {
  readonly parseableTypes: MimeTypeInfo[]
  parseBody(body: string | Buffer, headers: HttpRequestHeadersAccessor): string | object | Promise<object>
}
export const HttpBodyParser = localToken.opinionated<HttpBodyParser>('HttpBodyParser', {
  multi: false,
  restrictScope: ScopeBehavior.perInjector(HttpRequestScope),
})

type HttpBodyParserCache = Map<string, Constructor<HttpBodyParser>>
const HttpBodyParserCache = localToken.opinionated<HttpBodyParserCache>('HttpBodyParserCache', {
  multi: false,
})

export const HttpBodyParserCacheProvider: Provider<HttpBodyParserCache> = {
  provide: HttpBodyParserCache,
  useFactory: () => new Map<string, Constructor<HttpBodyParser>>(),
}

export function isSupportingBodyParser(bodyParser: BodyParserMetadata, contentType: HttpContentType): boolean {
  const [contentTypeMimeInfo] = parseMimeTypes(contentType.contentType)
  return !!bodyParser.contentTypes.find(mimeTypesAreCompatible.bind(undefined, contentTypeMimeInfo))
}

export function selectBodyParser(
  contentType: HttpContentType,
  bodyParsers: BodyParserInfo[],
): Constructor<HttpBodyParser> {
  for (const bodyParser of bodyParsers) {
    if (isSupportingBodyParser(bodyParser.metadata, contentType)) {
      return bodyParser.constructor
    }
  }
}

const SelectedBodyParser = localToken.opinionated<Constructor<HttpBodyParser>>('SelectedBodyParser', {
  multi: false,
  restrictScope: ScopeBehavior.perInjector(HttpRequestScope),
})
const SelectedBodyParserProvider: Provider<Constructor<HttpBodyParser>> = {
  provide: SelectedBodyParser,
  useFactory(
    req: HttpRequest,
    headers: HttpRequestHeadersAccessor,
    bodyParsers: BodyParserInfo[],
    cache: HttpBodyParserCache,
  ) {
    const contentType = headers.get(HttpHeader.contentType) || { contentType: MimeType.unknown }
    const cacheKey = `${req.path};${contentType.contentType}`

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
  deps: [HttpRequest, HttpRequestHeadersAccessor, BodyParserInfo, HttpBodyParserCache],
}

export const HttpBodyParserProvider: Provider<HttpBodyParser> = {
  provide: HttpBodyParser,
  async useFactory(injector: Injector, SelectedBodyParser: Constructor<HttpBodyParser>): Promise<HttpBodyParser> {
    return (await injector.inject(SelectedBodyParser)) as HttpBodyParser
  },
  async: true,
  deps: [Injector, SelectedBodyParser],
  providers: [SelectedBodyParserProvider],
}
