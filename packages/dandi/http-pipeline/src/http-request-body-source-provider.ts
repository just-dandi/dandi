import { InjectionScope, Injector, Provider } from '@dandi/core'
import { HttpRequestHeaders, HttpRequestBodySource, HttpRequestRawBody } from '@dandi/http'

import { BodyParserInfo } from './body-parsing/body-parser-decorator'
import { HttpBodyParser } from './body-parsing/http-body-parser'
import { localOpinionatedToken } from './local-token'

const BruteForceParsedBody = localOpinionatedToken<object>('BruteForceParsedBody', {
  multi: false,
})

async function httpRequestBodySourceFactory(
  injector: Injector,
  parser: HttpBodyParser,
  body: string | Buffer,
  headers: HttpRequestHeaders,
  allParsers: BodyParserInfo[],
): Promise<string | object> {
  if (!parser) {
    return bruteForceBodyParse(injector, allParsers)
  }
  return parser.parseBody(body, headers)
}

function bruteForceBodyParse(
  injector: Injector,
  allParsers: BodyParserInfo[],
): Promise<object> {
  const parserConstructors = allParsers.map(info => info.constructor)
  const provider: Provider<string | object> = {
    provide: BruteForceParsedBody,
    useFactory: bruteForceSelectBodyParser,
    async: true,
    deps: [
      HttpRequestRawBody,
      HttpRequestHeaders,
      ...parserConstructors,
    ],
    providers: [
      ...parserConstructors,
    ],
  }
  const bruteForceScope: InjectionScope = function BruteForceScope() {}
  const bruteForceInjector = injector.createChild(bruteForceScope, [provider])
  return bruteForceInjector.inject(BruteForceParsedBody)
}

async function bruteForceSelectBodyParser(
  rawBody: string | Buffer,
  headers: HttpRequestHeaders,
  ...bodyParsers: HttpBodyParser[]
): Promise<string | object> {
  for (const bodyParser of bodyParsers) {
    try {
      return await bodyParser.parseBody(rawBody, headers)
    } catch (err) {
      // ignore error
    }
  }
  // TODO: create an error type
  throw new Error('no parsers were able to parse the body')
}

export const HttpRequestBodySourceProvider: Provider<string | object> = {
  provide: HttpRequestBodySource,
  useFactory: httpRequestBodySourceFactory,
  deps: [
    Injector,
    HttpBodyParser,
    HttpRequestRawBody,
    HttpRequestHeaders,
    BodyParserInfo,
  ],
  async: true,
}
