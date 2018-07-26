import { AppError } from '@dandi/common';

// tslint:disable max-classes-per-file

export class InvalidRegistrationTargetError extends AppError {
    constructor(public readonly target: any, public readonly options: any) {
        super('Invalid registration target');
    }
}

export class ConflictingRegistrationOptionsError extends AppError {
    constructor(message: string, public readonly existing: any, public target: any) {
        super(message);
    }
}

export class InvalidRepositoryContextError extends AppError {
    constructor(public readonly context: any) {
        super('A context must be specified');
    }
}
