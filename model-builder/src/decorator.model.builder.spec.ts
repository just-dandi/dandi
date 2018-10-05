import { MemberMetadata, OneOf, Property } from '@dandi/model';

import { expect } from 'chai';
import { createStubInstance, SinonSpy, SinonStubbedInstance, spy, stub } from 'sinon';

import { DecoratorModelBuilder } from './decorator.model.builder';
import { ModelValidationError } from './model.validation.error';
import { OneOfConversionError } from './one.of.conversion.error';
import { PrimitiveTypeConverter } from './primitive.type.converter';

describe('DecoratorModelBuilder', () => {
  let primitiveTypeValidator: SinonStubbedInstance<PrimitiveTypeConverter>;
  let builder: DecoratorModelBuilder;

  beforeEach(() => {
    primitiveTypeValidator = createStubInstance(PrimitiveTypeConverter);
    primitiveTypeValidator.convert.returnsArg(0);
    builder = new DecoratorModelBuilder(primitiveTypeValidator as any);
  });
  afterEach(() => {
    builder = undefined;
    primitiveTypeValidator = undefined;
  });

  describe('constructModel', () => {
    class TestModel {
      @Property(String)
      public prop1: string;

      @Property(Number)
      public prop2: number;
    }

    let constructMember: SinonSpy;

    beforeEach(() => {
      constructMember = spy(builder as any, 'constructMemberInternal');
    });

    it('returns the passed value directly if no type is provided', () => {
      const value = { prop1: 'foo', prop2: 'bar' };

      const result = builder.constructModel(null, value);

      expect(result).to.equal(value);
      expect(constructMember).not.to.have.been.called;
    });

    it('returns an instance of the specified type', () => {
      const value = { prop1: 'foo', prop2: '123' };

      const result = builder.constructModel(TestModel, value);

      expect(result).to.be.instanceOf(TestModel);
    });

    it('iterates through each of the member keys and calls constructMemberInternal', () => {
      builder.constructModel(TestModel, { prop1: 'foo', prop2: '123' });

      expect((builder as any).constructMemberInternal).to.have.been.calledTwice;

      const firstCallMeta: MemberMetadata = constructMember.firstCall.args[0];
      expect(firstCallMeta.type).to.equal(String);

      const firstCallKey = constructMember.firstCall.args[1];
      expect(firstCallKey).to.equal('prop1');

      const firstCallValue = constructMember.firstCall.args[2];
      expect(firstCallValue).to.equal('foo');

      const secondCallMeta: MemberMetadata = constructMember.secondCall.args[0];
      expect(secondCallMeta.type).to.equal(Number);

      const secondCallKey = constructMember.secondCall.args[1];
      expect(secondCallKey).to.equal('prop2');

      const secondCallValue = constructMember.secondCall.args[2];
      expect(secondCallValue).to.equal('123');
    });

    it('assigns the result of constructMemberInternal to each key', () => {
      const value = { prop1: 'foo', prop2: '123' };
      constructMember.restore();
      stub(builder as any, 'constructMemberInternal')
        .onFirstCall()
        .returnsArg(2)
        .onSecondCall()
        .returns(123);

      const result = builder.constructModel(TestModel, value);

      expect(result.prop1).to.equal('foo');
      expect(result.prop2).to.equal(123);
    });

    it('catches member validation errors and throws a ModelValidationError', () => {
      const value = { prop1: 'foo', prop2: '123' };
      constructMember.restore();
      const memberError = new Error('Your llama is lloose!');
      stub(builder as any, 'constructMemberInternal')
        .onFirstCall()
        .returnsArg(2)
        .onSecondCall()
        .throws(memberError);

      expect(() => builder.constructModel(TestModel, value))
        .to.throw(ModelValidationError)
        .contains({
          message: 'Error validating prop2: Your llama is lloose!',
          innerError: memberError,
        });
    });
  });

  describe('constructMember', () => {
    it('returns null if the value is null', () => {
      expect(builder.constructMember({}, 'prop', null)).to.be.null;
    });

    it('returns undefined if the value is undefined and the property is not required', () => {
      expect(builder.constructMember({}, 'prop', undefined)).to.be.undefined;
    });

    it('uses the primitive validator to convert primitive types', () => {
      builder.constructMember({ type: String }, 'prop', 'foo');

      expect(primitiveTypeValidator.convert).to.have.been.calledOnce.calledWithExactly('foo', { type: String });
    });

    it('converts complex types with constructModelInternal', () => {
      class TestModel {
        @Property(String)
        public prop1: string;

        @Property(Number)
        public prop2: number;
      }

      spy(builder as any, 'constructModelInternal');

      builder.constructMember({ type: TestModel }, 'prop', {
        prop1: 'foo',
        prop2: 'bar',
      });

      expect((builder as any).constructModelInternal).to.have.been.calledOnce.calledWithExactly(
        TestModel,
        { prop1: 'foo', prop2: 'bar' },
        'prop',
        {},
      );
    });

    describe('arrays', () => {
      it('converts each of the array members using the array subtype', () => {
        const meta: MemberMetadata = {
          type: Array,
          subType: String,
        };

        builder.constructMember(meta, 'obj', ['foo', 'bar']);
        expect(primitiveTypeValidator.convert)
          .to.have.been.calledTwice.calledWithExactly('foo', { type: String })
          .calledWithExactly('bar', { type: String });
      });

      it('throws an error if the input is not an array', () => {
        const meta: MemberMetadata = {
          type: Array,
          subType: String,
        };

        expect(() => builder.constructMember(meta, 'obj', '1, 2')).to.throw(ModelValidationError);
      });
    });

    describe('oneOf', () => {
      it('returns the result of the first successful validation', () => {
        const meta: MemberMetadata = {
          type: OneOf as any,
          oneOf: [Number, String],
        };

        spy(builder as any, 'constructMemberInternal');

        primitiveTypeValidator.convert
          .onFirstCall()
          .throws(new Error('Not a number'))
          .onSecondCall()
          .returnsArg(0);

        expect(builder.constructMember(meta, 'prop', 'foo')).to.equal('foo');
        expect((builder as any).constructMemberInternal).to.have.been.calledThrice;
      });

      it('throws a OneOfConversionError if the value cannot be converted as any of the provided options', () => {
        const meta: MemberMetadata = {
          type: OneOf as any,
          oneOf: [Number, Boolean],
        };

        spy(builder as any, 'constructMemberInternal');

        primitiveTypeValidator.convert
          .onFirstCall()
          .throws(new Error('Not a number'))
          .onSecondCall()
          .throws(new Error('Not a boolean'));

        expect(() => builder.constructMember(meta, 'prop', 'foo')).to.throw(OneOfConversionError);
      });
    });
  });
});
