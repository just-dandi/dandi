import { AppError } from '@dandi/common';

export class ProviderTypeError extends AppError {
    constructor(public readonly target: any) {
        super('Specified object is not a valid provider');
    }
}
