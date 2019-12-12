import { AppError } from '@dandi/common'

import { HttpStatusCode } from './http-status-code'

export class RequestError extends AppError {
  constructor(
    public readonly statusCode: number,
    public readonly internalMessage: string,
    message?: string,
    innerError?: Error,
  ) {
    super(message || 'Server Error', innerError)
  }
}

export function isRequestError(obj: any): obj is RequestError {
  return obj && obj.statusCode && obj.message
}

export class ServerError extends RequestError {
  constructor(internalMessage?: string) {
    super(HttpStatusCode.internalServerError, internalMessage)
  }
}

export class NotFoundError extends RequestError {
  constructor(message?: string) {
    super(HttpStatusCode.notFound, message, 'Not Found')
  }
}

export class UnauthorizedError extends RequestError {
  constructor(message?: string) {
    super(HttpStatusCode.unauthorized, message, 'Not Authorized')
  }
}

export class ForbiddenError extends RequestError {
  constructor(reason: string) {
    super(HttpStatusCode.forbidden, reason, 'Forbidden')
  }
}
