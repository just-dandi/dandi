import { AppError } from '@dandi/common'
import { HttpStatusCode, RequestError } from '@dandi/http'

import { Route } from './route'

export class RouteInitializationError extends RequestError {
  constructor(innerError: Error, public readonly route: Route) {
    super(
      AppError.getInnerError(RequestError, innerError)?.statusCode || HttpStatusCode.internalServerError,
      'Error initializing route',
      innerError.message,
      innerError,
    )
  }
}
