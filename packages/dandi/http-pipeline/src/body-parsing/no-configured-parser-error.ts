import { HttpStatusCode, MimeTypes, RequestError } from '@dandi/http'

export class NoConfiguredParserError extends RequestError {
  constructor(contentType: MimeTypes, innerError?: Error) {
    super(
      HttpStatusCode.notImplemented,
      undefined,
      `No configured body parser for request body of type '${contentType}`,
      innerError,
    )
  }
}
