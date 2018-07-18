import { AppError } from '@dandi/core';

export class ModelValidationError extends AppError {
    constructor(public readonly propertyName: string, innerError: Error) {
        super(`Error validating ${propertyName}: ${innerError.message}`, innerError);
    }
}
