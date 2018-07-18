import { AppError, Constructor } from '@dandi/core';
import { MappedInjectionToken }  from '@dandi/di-core';
import { MemberMetadata }        from '@dandi/model';

import { localOpinionatedToken } from './local.token';

export interface TypeValidator<T> {
    validate(value: any, metadata?: MemberMetadata): T;
}

export type ValidatedType = Constructor<any> | ((...args: any[]) => ParameterDecorator);

const tokens = new Map<ValidatedType, MappedInjectionToken<ValidatedType, TypeValidator<any>>>();

export function TypeValidator<T>(key: ValidatedType): MappedInjectionToken<ValidatedType, TypeValidator<any>> {
    let token = tokens.get(key);
    if (!token) {
        token = {
            provide: localOpinionatedToken<TypeValidator<T>>('TypeValidator', { multi: false }),
            key,
        };
        tokens.set(key, token);
    }
    return token;
}

export class TypeValidationError extends AppError {
    constructor(public readonly value: any, public readonly type: any) {
        super(`${value} is not a valid ${type.name}`);
    }
}
