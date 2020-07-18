import { HttpStatusCode, RequestError } from '@dandi/http'

export class ModelBindingError extends RequestError {
  constructor(innerError: Error) {
    super(HttpStatusCode.badRequest, null, innerError.message, innerError)
  }
}

export class ParamError extends RequestError {
  constructor(public readonly paramName: string, message: string, innerError?: Error) {
    super(HttpStatusCode.badRequest, innerError?.stack, message, innerError)
  }
}

export class InvalidParamError extends ParamError {
  constructor(paramName: string, innerError?: Error) {
    super(paramName, `Invalid param ${paramName}`, innerError)
  }
}

export class MissingParamError extends ParamError {
  constructor(paramName: string, innerError?: Error) {
    super(paramName, `Missing required param ${paramName}`, innerError)
  }
}
