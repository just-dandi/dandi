import { Primitive } from '@dandi/common';
import { MemberMetadata, OneOf, Property } from '@dandi/model';

import { expect } from 'chai';
import { createStubInstance, SinonSpy, SinonStubbedInstance, spy, stub } from 'sinon';

import { DecoratorModelValidator } from './decorator.model.validator';
import { MetadataValidationError } from './metadata.validation.error';
import { ModelValidationError }    from './model.validation.error';
import { OneOfValidationError }    from './one.of.validation.error';
import { PrimitiveTypeValidator }  from './primitive.type.validator';
import { RequiredPropertyError }   from './required.property.error';
import { TypeValidator }           from './type.validator';

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
        primitiveTypeValidator = undefined;
    });

    describe('validateModel', () => {

        class TestModel {

            @Property(String)
            public prop1: string;

            @Property(Number)
            public prop2: number;

        }

        let validateMember: SinonSpy;

        beforeEach(() => {
            validateMember = spy(validator, 'validateMember');
        });

        it('returns the passed value directly if no type is provided', () => {

            const value = { prop1: 'foo', prop2: 'bar' };

            const result = validator.validateModel(null, value);

            expect(result).to.equal(value);
            expect(validateMember).not.to.have.been.called;

        });

        it('returns an instance of the specified type', () => {

            const value = { prop1: 'foo', prop2: '123' };

            const result = validator.validateModel(TestModel, value);

            expect(result).to.be.instanceOf(TestModel);

        });

        it('iterates through each of the member keys and calls validateMember', () => {

            validator.validateModel(TestModel, { prop1: 'foo', prop2: '123' });

            expect(validator.validateMember).to.have.been.calledTwice;

            const firstCallMeta: MemberMetadata = validateMember.firstCall.args[0];
            expect(firstCallMeta.type).to.equal(String);

            const firstCallKey = validateMember.firstCall.args[1];
            expect(firstCallKey).to.equal('prop1');

            const firstCallValue = validateMember.firstCall.args[2];
            expect(firstCallValue).to.equal('foo');

            const secondCallMeta: MemberMetadata = validateMember.secondCall.args[0];
            expect(secondCallMeta.type).to.equal(Number);

            const secondCallKey = validateMember.secondCall.args[1];
            expect(secondCallKey).to.equal('prop2');

            const secondCallValue = validateMember.secondCall.args[2];
            expect(secondCallValue).to.equal('123');

        });

        it('assigns the result of validateMember to each key', () => {

            const value = { prop1: 'foo', prop2: '123' };
            validateMember.restore();
            stub(validator, 'validateMember')
                .onFirstCall().returnsArg(2)
                .onSecondCall().returns(123);

            const result = validator.validateModel(TestModel, value);

            expect(result.prop1).to.equal('foo');
            expect(result.prop2).to.equal(123);

        });

        it('catches member validation errors and throws a ModelValidationError', () => {

            const value = { prop1: 'foo', prop2: '123' };
            validateMember.restore();
            const memberError = new Error('Your llama is lloose!');
            stub(validator, 'validateMember')
                .onFirstCall().returnsArg(2)
                .onSecondCall().throws(memberError);

            expect(() => validator.validateModel(TestModel, value))
                .to.throw(ModelValidationError)
                .contains({ message: 'Error validating prop2: Your llama is lloose!', innerError: memberError });

        });

    });

    describe('validateMember', () => {

        it('throws a RequiredPropertyError for properties marked with @Required() if the value is null', () => {

            expect(() => validator.validateMember({ required: true }, 'prop', null))
                .to.throw(RequiredPropertyError)
                .contains({ message: 'The \'prop\' property is required' });

        });

        it('throws a RequiredPropertyError for properties marked with @Required() if the value is undefined', () => {

            expect(() => validator.validateMember({ required: true }, 'prop', undefined))
                .to.throw(RequiredPropertyError)
                .contains({ message: 'The \'prop\' property is required' });

        });

        it('returns null if the value is null and the property is not required', () => {

            expect(validator.validateMember({}, 'prop', null)).to.be.null;

        });

        it('returns undefined if the value is undefined and the property is not required', () => {

            expect(validator.validateMember({}, 'prop', undefined)).to.be.undefined;

        });

        it('uses the primitive validator to validate primitive types', () => {

            validator.validateMember({ type: String }, 'prop', 'foo');

            expect(primitiveTypeValidator.validate).to.have.been
                .calledOnce
                .calledWithExactly('foo', { type: String });

        });

        it('validates complex types with validateModel', () => {

            class TestModel {

                @Property(String)
                public prop1: string;

                @Property(Number)
                public prop2: number;

            }

            spy(validator, 'validateModel');

            validator.validateMember({ type: TestModel }, 'prop', { prop1: 'foo', prop2: 'bar' });

            expect(validator.validateModel).to.have.been
                .calledOnce
                .calledWithExactly(TestModel, { prop1: 'foo', prop2: 'bar' }, 'prop');

        });

        describe('arrays', () => {

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

        describe('oneOf', () => {

            it('returns the result of the first successful validation', () => {

                const meta: MemberMetadata = {
                    type: OneOf as any,
                    oneOf: [Number, String],
                };

                spy(validator, 'validateMember');

                primitiveTypeValidator.validate
                    .onFirstCall().throws(new Error('Not a number'))
                    .onSecondCall().returnsArg(0);

                expect(validator.validateMember(meta, 'prop', 'foo')).to.equal('foo');
                expect(validator.validateMember).to.have.been.calledThrice;

            });

            it('throws a OneOfValidationError if the value cannot be validated as any of the provided options', () => {

                const meta: MemberMetadata = {
                    type: OneOf as any,
                    oneOf: [Number, Boolean],
                };

                spy(validator, 'validateMember');

                primitiveTypeValidator.validate
                    .onFirstCall().throws(new Error('Not a number'))
                    .onSecondCall().throws(new Error('Not a boolean'));

                expect(() => validator.validateMember(meta, 'prop', 'foo'))
                    .to.throw(OneOfValidationError);

            });

        });

        describe('metadata validation', () => {

            it('validates patterns', () => {

                expect(validator.validateMember({ type: String, pattern: /foo/ }, 'prop', 'foo'))
                    .to.equal('foo');

            });

            it('throws a MetadataValidationError if the value does not match a pattern', () => {

                expect(() => validator.validateMember({ type: String, pattern: /bar/ }, 'prop', 'foo'))
                    .to.throw(MetadataValidationError)
                    .contains({ message: 'pattern' });

            });

            it('validates a minimum string length', () => {

                expect(validator.validateMember({ type: String, minLength: 3 }, 'prop', 'foo'))
                    .to.equal('foo');

            });

            it('throws a MetadataValidationError if the value is shorter than the minimum length', () => {

                expect(() => validator.validateMember({ type: String, minLength: 4 }, 'prop', 'foo'))
                    .to.throw(MetadataValidationError)
                    .contains({ message: 'minLength' });

            });

            it('validates a maximum string length', () => {

                expect(validator.validateMember({ type: String, maxLength: 4 }, 'prop', 'foo'))
                    .to.equal('foo');

            });

            it('throws a MetadataValidationError if the value is longer than the maximum length', () => {

                expect(() => validator.validateMember({ type: String, maxLength: 2 }, 'prop', 'foo'))
                    .to.throw(MetadataValidationError)
                    .contains({ message: 'maxLength' });

            });

            it('validates a minimum array length', () => {

                expect(validator.validateMember({ type: Array, subType: String, minLength: 3 }, 'prop', [1, 2, 3]))
                    .to.deep.equal([1, 2, 3]);

            });

            it('throws a MetadataValidationError if the array is smaller than the minimum length', () => {

                expect(() => validator.validateMember({ type: Array, subType: String, minLength: 4 }, 'prop', [1, 2, 3]))
                    .to.throw(MetadataValidationError)
                    .contains({ message: 'minLength' });

            });

            it('validates a maximum array length', () => {

                expect(validator.validateMember({ type: Array, subType: String, maxLength: 4 }, 'prop', [1, 2, 3]))
                    .to.deep.equal([1, 2, 3]);

            });

            it('throws a MetadataValidationError if the array is larger than the maximum length', () => {

                expect(() => validator.validateMember({ type: Array, subType: String, maxLength: 2 }, 'prop', [1, 2, 3]))
                    .to.throw(MetadataValidationError)
                    .contains({ message: 'maxLength' });

            });

            it('throws if minLength is defined, but the value does not have a length property', () => {

                expect(() => validator.validateMember({ type: Object, minLength: 4 }, 'prop', { foo: 'bar '}))
                    .to.throw(MetadataValidationError)
                    .contains({ message: 'minLength or maxLength value does not have a length property' });

            });

            it('throws if maxLength is defined, but the value does not have a length property', () => {

                expect(() => validator.validateMember({ type: Object, maxLength: 4 }, 'prop', { foo: 'bar '}))
                    .to.throw(MetadataValidationError)
                    .contains({ message: 'minLength or maxLength value does not have a length property' });

            });

            it('throws if minValue is defined, but the value is not numeric', () => {

                expect(() => validator.validateMember({ type: Number, minValue: 4 }, 'prop', 'foo'))
                    .to.throw(MetadataValidationError)
                    .contains({ message: 'minValue or maxValue value is not numeric' });

            });

            it('throws if maxValue is defined, but the value is not numeric', () => {

                expect(() => validator.validateMember({ type: Number, maxValue: 4 }, 'prop', 'foo'))
                    .to.throw(MetadataValidationError)
                    .contains({ message: 'minValue or maxValue value is not numeric' });

            });

            it('validates a minimum value', () => {

                expect(validator.validateMember({ type: Number, minValue: 4 }, 'prop', 5))
                    .to.equal(5);

            });

            it('throws a MetadataValidationError if the value is less than the minimum value', () => {

                expect(() => validator.validateMember({ type: Number, minValue: 2 }, 'prop', 1))
                    .to.throw(MetadataValidationError)
                    .contains({ message: 'minValue' });

            });

            it('validates a maximum value', () => {

                expect(validator.validateMember({ type: Number, minValue: 4 }, 'prop', 5))
                    .to.equal(5);

            });

            it('throws a MetadataValidationError if the value is greater than the maximum value', () => {

                expect(() => validator.validateMember({ type: Number, maxValue: 4 }, 'prop', 5))
                    .to.throw(MetadataValidationError)
                    .contains({ message: 'maxValue' });

            });

        });

    });

});
