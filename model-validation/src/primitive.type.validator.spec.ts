import { MemberMetadata, ModelBase, Property } from '@dandi/model';
import { expect } from 'chai';

import { DateTimeTypeValidator } from './date.time.type.validator';
import { ModelValidationError } from './model.validation.error';
import {
    BooleanTypeValidator,
    NumberTypeValidator,
    PrimitiveTypeValidator,
    StringTypeValidator,
} from './primitive.type.validator';

import { TypeValidationError, TypeValidator } from './type.validator';
import { UrlTypeValidator } from './url.type.validator';
import { UuidTypeValidator } from './uuid.type.validator';

describe('StringTypeValidator', () => {

    let validator: TypeValidator<any>;

    beforeEach(() => {
        validator = new StringTypeValidator();
    });
    afterEach(() => {
        validator = undefined;
    });

    describe('validate', () => {

        it('passes through string values', () => {
            expect(validator.validate('foo')).to.equal('foo');
        });
    });
});

describe('NumberTypeValidator', () => {

    let validator: TypeValidator<any>;

    beforeEach(() => {
        validator = new NumberTypeValidator();
    });
    afterEach(() => {
        validator = undefined;
    });

    describe('validate', () => {

        it('converts number values to numbers', () => {
            const result = validator.validate('42');
            expect(result).to.be.a('number');
            expect(result).to.equal(42);
        });

        it('throws an error if the value is not a valid number', () => {
            expect(() => validator.validate('foo')).to.throw(TypeValidationError);
        });
    });
});

describe('BooleanTypeValidator', () => {

    let validator: TypeValidator<any>;

    beforeEach(() => {
        validator = new BooleanTypeValidator();
    });
    afterEach(() => {
        validator = undefined;
    });

    describe('validate', () => {


        it('converts boolean values to booleans', () => {
            expect(validator.validate('true')).to.be.true;
            expect(validator.validate('True')).to.be.true;
            expect(validator.validate('TRUE')).to.be.true;
            expect(validator.validate('false')).to.be.false;
            expect(validator.validate('False')).to.be.false;
            expect(validator.validate('FALSE')).to.be.false;
        });

        it('throws an error if the value is not a valid boolean', () => {
            expect(() => validator.validate('flalse')).to.throw(TypeValidationError);
        });

    });

});


describe('PrimitiveTypeValidator', () => {

    let validator: PrimitiveTypeValidator;

    beforeEach(() => {
        validator = new PrimitiveTypeValidator(
            new BooleanTypeValidator(),
            new DateTimeTypeValidator(),
            new NumberTypeValidator(),
            new StringTypeValidator(),
            new UrlTypeValidator(),
            new UuidTypeValidator(),
        );
    });
    afterEach(() => {
        validator = undefined;
    });



});
