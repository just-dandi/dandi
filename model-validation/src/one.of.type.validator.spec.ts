import { Uuid } from '@dandi/common';

import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance } from 'sinon';

import { OneOfTypeValidator } from './one.of.type.validator';
import { OneOfValidationError } from './one.of.validation.error';
import { PrimitiveTypeValidator } from './primitive.type.validator';

describe('OneOfTypeValidator', () => {
  let primitive: SinonStubbedInstance<PrimitiveTypeValidator>;
  let validator: OneOfTypeValidator;

  beforeEach(() => {
    primitive = createStubInstance(PrimitiveTypeValidator);
    validator = new OneOfTypeValidator(primitive);
  });
  afterEach(() => {
    primitive = undefined;
    validator = undefined;
  });

  describe('validate', () => {
    it('returns the first type that successfully validate', () => {
      const uuid = Uuid.create();
      primitive.validate.onFirstCall().returns(uuid);

      const result = validator.validate(uuid.toString(), {
        oneOf: [Uuid, String],
      });

      expect(result).to.be.instanceof(Uuid);
      expect(result).to.equal(uuid);
    });

    it('returns the first type that successfully validate, ignoring exceptions thrown by failed validations', () => {
      const uuid = Uuid.create();
      primitive.validate.onFirstCall().throws(new Error('nope'));
      primitive.validate.onSecondCall().returns(uuid);

      const result = validator.validate(uuid.toString(), {
        oneOf: [Uuid, String],
      });

      expect(result).to.be.instanceof(Uuid);
      expect(result).to.equal(uuid);
    });

    it('throws a OneOfValidationError if none of the types validate', () => {
      const uuid = Uuid.create();
      primitive.validate.throws(new Error('nope'));

      expect(() =>
        validator.validate(uuid.toString(), { oneOf: [Uuid, String] }),
      ).to.throw(OneOfValidationError);
    });
  });
});
