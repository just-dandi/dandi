import { HttpStatusCode, RequestError } from '@dandi/http'

import { Route } from './route'

export class RouteInitializationError extends RequestError {
  constructor(innerError: Error, public readonly route: Route) {
    super(
      innerError instanceof RequestError ? innerError.statusCode : HttpStatusCode.internalServerError,
      'Error initializing route',
      innerError.message,
      innerError,
    )
  }
}
