import { AppError } from '@dandi/common';
import { HttpStatusCode } from '@dandi/mvc';

export class RequestError extends AppError {
  constructor(
    public readonly statusCode: number,
    public readonly internalMessage: string,
    message?: string,
    innerError?: Error,
  ) {
    super(message || 'Server Error', innerError);
  }
}

export class ServerError extends RequestError {
  constructor(internalMessage?: string) {
    super(HttpStatusCode.internalServerError, internalMessage);
  }
}

export class NotFoundError extends RequestError {
  constructor() {
    super(HttpStatusCode.notFound, null, 'Not Found');
  }
}

export class UnauthorizedError extends RequestError {
  constructor() {
    super(HttpStatusCode.unauthorized, null, 'Not Authorized');
  }
}

export class ForbiddenError extends RequestError {
  constructor(reason: string) {
    super(HttpStatusCode.forbidden, reason, 'Forbidden');
  }
}

export class ModelBindingError extends RequestError {
  constructor(innerError: Error) {
    super(HttpStatusCode.badRequest, null, innerError.message, innerError);
  }
}
