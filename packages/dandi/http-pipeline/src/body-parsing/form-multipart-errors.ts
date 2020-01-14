import { HttpStatusCode, RequestError } from '@dandi/http'

export class FormMultipartError extends RequestError {
  constructor(internalMessage: string, message?: string, innerError?: Error) {
    super(HttpStatusCode.badRequest, internalMessage, message, innerError)
  }
}

export class FormMultipartMissingBoundaryError extends FormMultipartError {
  constructor() {
    super(undefined, `The 'content-type' header is missing the multipart boundary directive`)
  }
}
