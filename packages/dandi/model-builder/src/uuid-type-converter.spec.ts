import { Uuid } from '@dandi/common'
import { TypeConversionError, UuidTypeConverter } from '@dandi/model-builder'

import { expect } from 'chai'

describe('UuidTypeConverter', () => {
  let validator: UuidTypeConverter

  beforeEach(() => {
    validator = new UuidTypeConverter()
  })
  afterEach(() => {
    validator = undefined
  })

  describe('convert', () => {
    it('returns a Uuid instance for valid uuid strings', () => {
      const value = Uuid.create()
      expect(validator.convert(value.toString()).toString()).to.equal(value.toString())
    })

    it('returns the same Uuid instance for the same uuid string', () => {
      const value = Uuid.create()
      expect(validator.convert(value.toString())).to.equal(value)
      expect(validator.convert(value.toString())).to.equal(value)
      expect(validator.convert(value.toString())).to.equal(value)
    })

    it('throws a TypeConversionError if the value is not a valid uuid', () => {
      const value = Uuid.create()
        .toString()
        .substring(10)
      expect(() => validator.convert(value)).to.throw(TypeConversionError)
    })
  })
})
