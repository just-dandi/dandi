import { AppError, Constructor, DateTime, Primitive, Url, Uuid } from '@dandi/common';
import { Inject, Injectable } from '@dandi/core';
import { MemberMetadata }     from '@dandi/model';

import { TypeValidationError, TypeValidator } from './type.validator';

@Injectable(TypeValidator(String))
export class StringTypeValidator implements TypeValidator<string> {

    public validate(obj: string): string {
        return obj;
    }

}

@Injectable(TypeValidator(Number))
export class NumberTypeValidator implements TypeValidator<number> {

    public validate(obj: string): number {
        const result = parseInt(obj, 10);
        if (isNaN(result)) {
            throw new TypeValidationError(obj, Number);
        }
        return result;
    }
}

@Injectable(TypeValidator(Boolean))
export class BooleanTypeValidator implements TypeValidator<boolean> {

    public validate(obj: any): boolean {
        if (obj === true || obj === false) {
            return obj;
        }
        if (obj === 0) {
            return false;
        }
        if (obj === 1) {
            return true;
        }
        if (typeof(obj) !== 'string') {
            obj = obj.toString();
        }
        if (obj.toLocaleLowerCase() === 'true') {
            return true;
        }
        if (obj.toLocaleLowerCase() === 'false') {
            return false;
        }
        throw new TypeValidationError(obj, Boolean);
    }

}

export interface PrimitiveTypeValidator extends TypeValidator<any> {
    isPrimitiveType(type: Constructor<any>): boolean;
}

@Injectable(TypeValidator(Primitive))
export class PrimitiveTypeValidator {

    private primitive = new Map<Constructor<any>, TypeValidator<any>>();

    constructor(
        @Inject(TypeValidator(Boolean)) booleanValidator: TypeValidator<Boolean>,
        @Inject(TypeValidator(DateTime)) dateTimeValidator: TypeValidator<DateTime>,
        @Inject(TypeValidator(Number)) numberValidator: TypeValidator<Number>,
        @Inject(TypeValidator(String)) stringValidator: TypeValidator<String>,
        @Inject(TypeValidator(Url)) urlValidator: TypeValidator<Url>,
        @Inject(TypeValidator(Uuid)) uuidValidator: TypeValidator<Uuid>,
    ) {
        this.primitive.set(Boolean, booleanValidator);
        this.primitive.set(DateTime, dateTimeValidator);
        this.primitive.set(Number, numberValidator);
        this.primitive.set(String, stringValidator);
        this.primitive.set(Url, urlValidator);
        this.primitive.set(Uuid, uuidValidator);
    }

    public validate(value: any, metadata?: MemberMetadata): any {
        const primitiveValidator = this.primitive.get(metadata.type);
        if (!primitiveValidator) {
            throw new AppError(`${metadata.type} cannot be validated by PrimitiveTypeValidator`);
        }
        return primitiveValidator.validate(value, metadata);
    }


}
