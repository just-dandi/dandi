import { HttpStatusCode, RequestError } from '@dandi/http'

export class ModelBindingError extends RequestError {
  constructor(innerError: Error) {
    super(HttpStatusCode.badRequest, null, innerError.message, innerError)
  }
}

export class MissingParamError extends RequestError {
  constructor(paramName: string, innerError?: Error) {
    super(HttpStatusCode.badRequest, null, `Missing required param ${paramName}`, innerError)
  }
}
