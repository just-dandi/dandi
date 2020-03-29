import { DandiInjectionError } from '@dandi/core'
import { HttpStatusCode, RequestError } from '@dandi/http'
import { ModelErrors } from '@dandi/model-builder'

export class ModelBindingError extends RequestError {
  constructor(public readonly errors: ModelErrors, innerError?: Error) {
    super(HttpStatusCode.badRequest, innerError?.message, errors.toString(), innerError)
  }
}
DandiInjectionError.doNotWrap(ModelBindingError)

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
