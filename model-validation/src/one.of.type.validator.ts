import { Primitive }             from '@dandi/common';
import { Inject, Injectable }    from '@dandi/core';
import { MemberMetadata, OneOf } from '@dandi/model';

import { OneOfValidationAttempt, OneOfValidationError } from './one.of.validation.error';
import { TypeValidator }          from './type.validator';

@Injectable(TypeValidator(OneOf))
export class OneOfTypeValidator implements TypeValidator<any>{

    constructor(
        @Inject(TypeValidator(Primitive)) private validator: TypeValidator<any>,
    ) {}

    public validate(value: any, metadata?: MemberMetadata): any {
        const attempts: OneOfValidationAttempt[] = [];
        for (const type of metadata.oneOf) {
            try {
                const oneOfMeta: MemberMetadata = { type };
                return this.validator.validate(value, oneOfMeta);
            } catch (error) {
                attempts.push({ type, error });
            }
        }
        throw new OneOfValidationError(attempts);
    }

}
