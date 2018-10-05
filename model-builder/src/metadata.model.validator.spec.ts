import { MetadataModelValidator, MetadataValidationError, RequiredPropertyError } from '@dandi/model-builder';
import { expect } from 'chai';

describe('MetadataModelValidator', () => {
  let validator: MetadataModelValidator;

  beforeEach(() => {
    validator = new MetadataModelValidator();
  });
  afterEach(() => {
    validator = undefined;
  });

  describe('validate', () => {
    it('throws a RequiredPropertyError for properties marked with @Required() if the value is null', () => {
      expect(() => validator.validateMember({ required: true }, 'prop', null))
        .to.throw(RequiredPropertyError)
        .contains({ message: "The 'prop' property is required" });
    });

    it('throws a RequiredPropertyError for properties marked with @Required() if the value is undefined', () => {
      expect(() => validator.validateMember({ required: true }, 'prop', undefined))
        .to.throw(RequiredPropertyError)
        .contains({ message: "The 'prop' property is required" });
    });
    it('validates patterns', () => {
      expect(validator.validateMember({ type: String, pattern: /foo/ }, 'prop', 'foo')).to.equal('foo');
    });

    it('throws a MetadataValidationError if the value does not match a pattern', () => {
      expect(() => validator.validateMember({ type: String, pattern: /bar/ }, 'prop', 'foo'))
        .to.throw(MetadataValidationError)
        .contains({ message: 'pattern' });
    });

    it('validates a minimum string length', () => {
      expect(validator.validateMember({ type: String, minLength: 3 }, 'prop', 'foo')).to.equal('foo');
    });

    it('throws a MetadataValidationError if the value is shorter than the minimum length', () => {
      expect(() => validator.validateMember({ type: String, minLength: 4 }, 'prop', 'foo'))
        .to.throw(MetadataValidationError)
        .contains({ message: 'minLength' });
    });

    it('validates a maximum string length', () => {
      expect(validator.validateMember({ type: String, maxLength: 4 }, 'prop', 'foo')).to.equal('foo');
    });

    it('throws a MetadataValidationError if the value is longer than the maximum length', () => {
      expect(() => validator.validateMember({ type: String, maxLength: 2 }, 'prop', 'foo'))
        .to.throw(MetadataValidationError)
        .contains({ message: 'maxLength' });
    });

    it('validates a minimum array length', () => {
      expect(
        validator.validateMember({ type: Array, valueType: String, minLength: 3 }, 'prop', [1, 2, 3]),
      ).to.deep.equal([1, 2, 3]);
    });

    it('throws a MetadataValidationError if the array is smaller than the minimum length', () => {
      expect(() => validator.validateMember({ type: Array, valueType: String, minLength: 4 }, 'prop', [1, 2, 3]))
        .to.throw(MetadataValidationError)
        .contains({ message: 'minLength' });
    });

    it('validates a maximum array length', () => {
      expect(
        validator.validateMember({ type: Array, valueType: String, maxLength: 4 }, 'prop', [1, 2, 3]),
      ).to.deep.equal([1, 2, 3]);
    });

    it('throws a MetadataValidationError if the array is larger than the maximum length', () => {
      expect(() => validator.validateMember({ type: Array, valueType: String, maxLength: 2 }, 'prop', [1, 2, 3]))
        .to.throw(MetadataValidationError)
        .contains({ message: 'maxLength' });
    });

    it('throws if minLength is defined, but the value does not have a length property', () => {
      expect(() =>
        validator.validateMember({ type: Object, minLength: 4 }, 'prop', {
          foo: 'bar ',
        }),
      )
        .to.throw(MetadataValidationError)
        .contains({
          message: 'minLength or maxLength value does not have a length property',
        });
    });

    it('throws if maxLength is defined, but the value does not have a length property', () => {
      expect(() =>
        validator.validateMember({ type: Object, maxLength: 4 }, 'prop', {
          foo: 'bar ',
        }),
      )
        .to.throw(MetadataValidationError)
        .contains({
          message: 'minLength or maxLength value does not have a length property',
        });
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
      expect(validator.validateMember({ type: Number, minValue: 4 }, 'prop', 5)).to.equal(5);
    });

    it('throws a MetadataValidationError if the value is less than the minimum value', () => {
      expect(() => validator.validateMember({ type: Number, minValue: 2 }, 'prop', 1))
        .to.throw(MetadataValidationError)
        .contains({ message: 'minValue' });
    });

    it('validates a maximum value', () => {
      expect(validator.validateMember({ type: Number, minValue: 4 }, 'prop', 5)).to.equal(5);
    });

    it('throws a MetadataValidationError if the value is greater than the maximum value', () => {
      expect(() => validator.validateMember({ type: Number, maxValue: 4 }, 'prop', 5))
        .to.throw(MetadataValidationError)
        .contains({ message: 'maxValue' });
    });
  });
});
