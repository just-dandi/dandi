import { HttpStatusCode, MimeType, RequestError } from '@dandi/http'

export class NoConfiguredParserError extends RequestError {
  constructor(contentType: MimeType, innerError?: Error) {
    super(
      HttpStatusCode.notImplemented,
      undefined,
      `No configured body parser for request body of type '${contentType}`,
      innerError,
    )
  }
}
