import { MetadataModelValidator, ModelValidationError, RequiredPropertyError } from '@dandi/model-builder'
import { expect } from 'chai'

describe('MetadataModelValidator', () => {
  let validator: MetadataModelValidator

  beforeEach(() => {
    validator = new MetadataModelValidator()
  })
  afterEach(() => {
    validator = undefined
  })

  describe('validate', () => {
    it('returns a RequiredPropertyError for properties marked with @Required() if the value is an empty string', () => {
      const [error] = validator.validateMember({ required: true }, 'prop', '')
      expect(error)
        .to.be.instanceof(RequiredPropertyError)
        .contains({ errorKey: 'required', memberKey: 'prop' })
    })
    it('returns a RequiredPropertyError for properties marked with @Required() if the value is null', () => {
      const [error] = validator.validateMember({ required: true }, 'prop', null)
      expect(error)
        .to.be.instanceof(RequiredPropertyError)
        .contains({ errorKey: 'required', memberKey: 'prop' })
    })

    it('throws a RequiredPropertyError for properties marked with @Required() if the value is undefined', () => {
      const [error] = validator.validateMember({ required: true }, 'prop', undefined)
      expect(error)
        .to.be.instanceof(RequiredPropertyError)
        .contains({ errorKey: 'required', memberKey: 'prop' })
    })
    it('validates patterns', () => {
      expect(validator.validateMember({ type: String, pattern: /foo/ }, 'prop', 'foo')).to.be.empty
    })

    it('throws a ModelValidationError if the value does not match a pattern', () => {
      const [error] = validator.validateMember({ type: String, pattern: /bar/ }, 'prop', 'foo')
      expect(error)
        .to.be.instanceof(ModelValidationError)
        .contains({ errorKey: 'pattern' })
    })

    it('validates a minimum string length', () => {
      expect(validator.validateMember({ type: String, minLength: 3 }, 'prop', 'foo')).to.be.empty
    })

    it('throws a ModelValidationError if the value is shorter than the minimum length', () => {
      const [error] = validator.validateMember({ type: String, minLength: 4 }, 'prop', 'foo')
      expect(error)
        .to.be.instanceof(ModelValidationError)
        .contains({ errorKey: 'minLength' })
    })

    it('validates a maximum string length', () => {
      expect(validator.validateMember({ type: String, maxLength: 4 }, 'prop', 'foo')).to.be.empty
    })

    it('throws a ModelValidationError if the value is longer than the maximum length', () => {
      const [error] = validator.validateMember({ type: String, maxLength: 2 }, 'prop', 'foo')
      expect(error)
        .to.be.instanceof(ModelValidationError)
        .contains({ errorKey: 'maxLength' })
    })

    it('validates a minimum array length', () => {
      expect(
        validator.validateMember({ type: Array, valueType: String, minLength: 3 }, 'prop', [1, 2, 3]),
      ).to.be.empty
    })

    it('throws a ModelValidationError if the array is smaller than the minimum length', () => {
      const [error] = validator.validateMember({ type: Array, valueType: String, minLength: 4 }, 'prop', [1, 2, 3])
      expect(error)
        .to.be.instanceof(ModelValidationError)
        .contains({ errorKey: 'minLength' })
    })

    it('validates a maximum array length', () => {
      expect(
        validator.validateMember({ type: Array, valueType: String, maxLength: 4 }, 'prop', [1, 2, 3]),
      ).to.be.empty
    })

    it('throws a ModelValidationError if the array is larger than the maximum length', () => {
      const [error] = validator.validateMember({ type: Array, valueType: String, maxLength: 2 }, 'prop', [1, 2, 3])
      expect(error)
        .to.be.instanceof(ModelValidationError)
        .contains({ errorKey: 'maxLength' })
    })

    it('throws if minLength is defined, but the value does not have a length property', () => {
      const [error] = validator.validateMember({ type: Object, minLength: 4 }, 'prop', {
          foo: 'bar ',
        })
      expect(error)
        .to.be.instanceof(ModelValidationError)
        .contains({
          errorKey: 'minLength',
          message: 'value does not have a length property',
        })
    })

    it('throws if maxLength is defined, but the value does not have a length property', () => {
      const [error] = validator.validateMember({ type: Object, maxLength: 4 }, 'prop', {
          foo: 'bar ',
        })
      expect(error)
        .to.be.instanceof(ModelValidationError)
        .contains({
          errorKey: 'maxLength',
          message: 'value does not have a length property',
        })
    })

    it('throws if minValue is defined, but the value is not numeric', () => {
      const [error] = validator.validateMember({ type: Number, minValue: 4 }, 'prop', 'foo')
      expect(error)
        .to.be.instanceof(ModelValidationError)
        .contains({ errorKey: 'minValue', message: 'value is not numeric' })
    })

    it('throws if maxValue is defined, but the value is not numeric', () => {
      const [error] = validator.validateMember({ type: Number, maxValue: 4 }, 'prop', 'foo')
      expect(error)
        .to.be.instanceof(ModelValidationError)
        .contains({ errorKey: 'maxValue', message: 'value is not numeric' })
    })

    it('validates a minimum value', () => {
      expect(validator.validateMember({ type: Number, minValue: 4 }, 'prop', 5)).to.be.empty
    })

    it('throws a ModelValidationError if the value is less than the minimum value', () => {
      const [error] = validator.validateMember({ type: Number, minValue: 2 }, 'prop', 1)
      expect(error)
        .to.be.instanceof(ModelValidationError)
        .contains({ errorKey: 'minValue' })
    })

    it('validates a maximum value', () => {
      expect(validator.validateMember({ type: Number, minValue: 4 }, 'prop', 5)).to.be.empty
    })

    it('throws a ModelValidationError if the value is greater than the maximum value', () => {
      const [error] = validator.validateMember({ type: Number, maxValue: 4 }, 'prop', 5)
      expect(error)
        .to.be.instanceof(ModelValidationError)
        .contains({ errorKey: 'maxValue' })
    })
  })
})
