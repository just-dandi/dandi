import { Constructor, isPrimitiveType, Primitive } from '@dandi/common';
import { Inject, Injectable }                      from '@dandi/core';
import { getAllKeys, getModelMetadata, MemberMetadata, OneOf } from '@dandi/model';

import { MetadataValidationError }            from './metadata.validation.error';
import { ModelValidationError }               from './model.validation.error';
import { ModelValidator }                     from './model.validator';
import { OneOfValidationAttempt, OneOfValidationError } from './one.of.validation.error';
import { RequiredPropertyError }              from './required.property.error';
import { TypeValidationError, TypeValidator } from './type.validator';

@Injectable(ModelValidator)
export class DecoratorModelValidator implements ModelValidator {

    constructor(
        @Inject(TypeValidator(Primitive)) private primitive: TypeValidator<Primitive<any>>,
    ) {}

    public validateModel(type: Constructor<any>, obj: any, parentKey?: string): any {

        if (!type) {
            return obj;
        }

        const modelMetadata = getModelMetadata(type);
        const typeKeys = getAllKeys(modelMetadata);

        const result = new type(obj);

        typeKeys.forEach(key => {

            const objValue = obj[key];
            const memberMetadata = modelMetadata[key];
            try {
                result[key] = this.validateMember(memberMetadata, this.getKey(parentKey, key), objValue);
            } catch (err) {
                throw new ModelValidationError(key, err);
            }
        });

        return result;
    }

    public validateMember(metadata: MemberMetadata, key: string, value: any): any {

        if (value === null || value === undefined) {
            if (metadata.required) {
                throw new RequiredPropertyError(key);
            }
            return value;
        }

        const result = this.validateMemberByType(metadata, key, value);

        return this.validateMetadata(metadata, result);
    }

    private validateMemberByType(metadata: MemberMetadata, key: string, value: any): any {

        if (metadata.type as any === Array) {
            return this.validateArrayMember(metadata, key, value);
        }

        if (metadata.type as any === OneOf) {
            return this.validateOneOf(metadata, key, value);
        }

        if (isPrimitiveType(metadata.type)) {
            return this.validatePrimitive(metadata, value);
        }
        return this.validateModel(metadata.type, value, key);
    }

    private validateMetadata(metadata: MemberMetadata, value: any): any {

        if (metadata.pattern && !metadata.pattern.test(value.toString())) {
            throw new MetadataValidationError('pattern');
        }
        if ((!isNaN(metadata.minLength) || !isNaN(metadata.maxLength)) && value.length === undefined) {
            throw new MetadataValidationError('minLength or maxLength', 'value does not have a length property');
        }
        if (!isNaN(metadata.minLength) && value.length < metadata.minLength) {
            throw new MetadataValidationError('minLength');
        }
        if (!isNaN(metadata.maxLength) && value.length > metadata.maxLength) {
            throw new MetadataValidationError('maxLength');
        }
        if ((!isNaN(metadata.minValue) || !isNaN(metadata.maxValue)) && isNaN(value as any)) {
            throw new MetadataValidationError('minValue or maxValue', 'value is not numeric');
        }
        if (!isNaN(metadata.minValue) && value as any < metadata.minValue) {
            throw new MetadataValidationError('minValue');
        }
        if (!isNaN(metadata.maxValue) && value as any > metadata.maxValue) {
            throw new MetadataValidationError('maxValue');
        }

        return value;
    }

    private validatePrimitive(metadata: MemberMetadata, value: any): any {
        return this.primitive.validate(value, metadata);
    }

    private getKey(parentKey: string, key: string): string {
        const isNumericKey = !isNaN(parseInt(key, 10));
        const keyStr = isNumericKey ? `[${key}]` : key;
        return `${parentKey || ''}${parentKey && !isNumericKey ? '.' : ''}${keyStr}`;
    }

    private validateOneOf(metadata: MemberMetadata, key: string, value: any[]): any {
        const attempts: OneOfValidationAttempt[] = [];
        for (const type of metadata.oneOf) {
            try {
                const oneOfMeta: MemberMetadata = { type };
                return this.validateMember(oneOfMeta, key, value);
            } catch (error) {
                attempts.push({ type, error });
            }
        }
        throw new OneOfValidationError(attempts);
    }

    private validateArrayMember(metadata: MemberMetadata, key: string, value: any[]): any[] {
        if (!Array.isArray(value)) {
            throw new ModelValidationError(key, new TypeValidationError(value, Array));
        }

        return value.map((entry, index) => {
            const entryMeta: MemberMetadata = { type: metadata.subType };
            return this.validateMember(entryMeta, this.getKey(key, index.toString()), entry);
        });
    }
}
