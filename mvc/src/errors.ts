import { AppError } from '@dandi/common';

export class RequestError extends AppError {
    constructor(public readonly statusCode: number, public readonly internalMessage: string, message?: string, innerError?: Error) {
        super(message || 'Server Error', innerError);
    }
}

export class ServerError extends RequestError {
    constructor(internalMessage?: string) {
        super(500, internalMessage);
    }
}

export class NotFoundError extends RequestError {
    constructor() {
        super(404, null, 'Not Found');
    }
}

export class NotAuthorizedError extends RequestError {
    constructor() {
        super(401, null, 'Not Authorized');
    }
}

export class ForbiddenError extends RequestError {
    constructor(reason: string) {
        super(403, reason, 'Forbidden');
    }
}

export class ModelBindingError extends RequestError {
    constructor(innerError: Error) {
        super(400, null, innerError.message, innerError);
    }
}
