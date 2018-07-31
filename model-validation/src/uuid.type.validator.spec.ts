import { Uuid } from '@dandi/common';

import { expect } from 'chai';

import { TypeValidationError } from './type.validator';
import { UuidTypeValidator } from './uuid.type.validator';

describe('UuidTypeValidator', () => {
  let validator: UuidTypeValidator;

  beforeEach(() => {
    validator = new UuidTypeValidator();
  });
  afterEach(() => {
    validator = undefined;
  });

  describe('validate', () => {
    it('returns a Uuid instance for valid uuid strings', () => {
      const value = Uuid.create();
      expect(validator.validate(value.toString()).toString()).to.equal(
        value.toString(),
      );
    });

    it('returns the same Uuid instance for the same uuid string', () => {
      const value = Uuid.create();
      expect(validator.validate(value.toString())).to.equal(value);
      expect(validator.validate(value.toString())).to.equal(value);
      expect(validator.validate(value.toString())).to.equal(value);
    });

    it('throws a TypeValidationError if the value is not a valid uuid', () => {
      const value = Uuid.create()
        .toString()
        .substring(10);
      expect(() => validator.validate(value)).to.throw(TypeValidationError);
    });
  });
});
