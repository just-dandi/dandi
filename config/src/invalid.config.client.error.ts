import { AppError } from '@dandi/core';

export class InvalidConfigClientError extends AppError {
    constructor(message?: string) {
        super(message);
    }
}
