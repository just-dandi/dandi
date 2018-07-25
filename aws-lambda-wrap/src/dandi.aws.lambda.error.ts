import { AppError } from '@dandi/core';

export class DandiAwsLambdaError extends AppError {

    constructor(message?: string, innerError?: Error) {
        super(message, innerError);
    }

}
