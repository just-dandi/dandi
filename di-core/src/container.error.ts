import { AppError } from '@dandi/core';

export class ContainerError extends AppError {

    constructor(message: string, innerError?: Error) {
        super(message, innerError);
    }

}

export class ContainerNotInitializedError extends ContainerError {
    constructor() {
        super('Container is not initialized - start() must be called before attempting to resolve dependencies');
    }
}

export class MissingTokenError extends ContainerError {
    constructor() {
        super('The `token` argument is required');
    }
}
