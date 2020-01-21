import { Constructor } from '@dandi/common'
import { InjectionToken, Provider, Injector, ScopeBehavior, MissingProviderError, InjectorContext } from '@dandi/core'
import {
  HttpContentType,
  HttpHeader,
  HttpRequest,
  HttpRequestHeadersAccessor,
  HttpRequestScope,
  mimeTypesAreCompatible,
  MimeTypeInfo,
  parseMimeTypes,
} from '@dandi/http'

import { localOpinionatedToken } from '../local-token'

import { BodyParserInfo, BodyParserMetadata } from './body-parser-decorator'

export interface HttpBodyParser {
  readonly parseableTypes: MimeTypeInfo[]
  parseBody(body: string | Buffer, headers: HttpRequestHeadersAccessor): string | object | Promise<object>
}
export const HttpBodyParser: InjectionToken<HttpBodyParser> = localOpinionatedToken('HttpBodyParser', {
  multi: false,
  restrictScope: ScopeBehavior.perInjector(HttpRequestScope),
})

type HttpBodyParserCache = Map<string, Constructor<HttpBodyParser>>
const HttpBodyParserCache: InjectionToken<HttpBodyParserCache> = localOpinionatedToken('HttpBodyParserCache', {
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

export function selectBodyParser(contentType: HttpContentType, bodyParsers: BodyParserInfo[]): Constructor<HttpBodyParser> {
  for (const bodyParser of bodyParsers) {
    if (isSupportingBodyParser(bodyParser.metadata, contentType)) {
      return bodyParser.constructor
    }
  }
}

const SelectedBodyParser: InjectionToken<Constructor<HttpBodyParser>> = localOpinionatedToken('SelectedBodyParser', {
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
    context: InjectorContext,
  ) {

    const contentType = headers.get(HttpHeader.contentType)
    if (!contentType) {
      throw new MissingProviderError(SelectedBodyParser, context)
    }
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
  deps: [
    HttpRequest,
    HttpRequestHeadersAccessor,
    BodyParserInfo,
    HttpBodyParserCache,
    InjectorContext,
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
