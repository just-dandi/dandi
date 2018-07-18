import { Primitive } from '@dandi/core';
import { MemberMetadata } from '@dandi/model';

import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance } from 'sinon';

import { DecoratorModelValidator } from './decorator.model.validator';
import { ModelValidationError }    from './model.validation.error';
import { PrimitiveTypeValidator }  from './primitive.type.validator';
import { TypeValidator } from './type.validator';

describe('DecoratorModelValidator', () => {

    let primitiveTypeValidator: SinonStubbedInstance<TypeValidator<Primitive<any>>>;
    let validator: DecoratorModelValidator;

    beforeEach(() => {
        primitiveTypeValidator = createStubInstance(PrimitiveTypeValidator);
        primitiveTypeValidator.validate.returnsArg(0);
        validator = new DecoratorModelValidator(primitiveTypeValidator);
    });
    afterEach(() => {
        validator = undefined;
    });

    describe('validateMember', () => {

        it('validates each of the array members using the array subtype', () => {

            const meta: MemberMetadata = {
                type: Array,
                subType: String,
            };

            validator.validateMember(meta, 'obj', ['foo', 'bar']);
            expect(primitiveTypeValidator.validate).to.have.been
                .calledTwice
                .calledWithExactly('foo', { type: String })
                .calledWithExactly('bar', { type: String });

        });

        it('throws an error if the input is not an array', () => {
            const meta: MemberMetadata = {
                type: Array,
                subType: String,
            };

            expect(() => validator.validateMember(meta, 'obj', '1, 2')).to.throw(ModelValidationError);
        });

    });

});
