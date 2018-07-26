import { AppError, Constructor } from '@dandi/common';

export interface OneOfValidationAttempt {
    type: Constructor<any>;
    error: Error;
}

export class OneOfValidationError extends AppError {

    constructor(public readonly attempts: OneOfValidationAttempt[]) {
        super(`Could not validate against any of the specified types`);
    }

}
