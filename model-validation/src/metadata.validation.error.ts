import { AppError } from '@dandi/core';

export class MetadataValidationError extends AppError {
    constructor(public readonly metadataKey, message?: string) {
        super(`${metadataKey}${message ? ' ' : ''}${message}`);
    }
}
