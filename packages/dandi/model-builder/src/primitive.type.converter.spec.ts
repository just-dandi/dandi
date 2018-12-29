import { AppError, Url, Uuid } from '@dandi/common'
import { DateTime } from 'luxon'
import { expect } from 'chai'
import { SinonStubbedInstance, createStubInstance } from 'sinon'

import { DateTimeTypeConverter } from './date.time.type.converter'
import {
  BooleanTypeConverter,
  NumberTypeConverter,
  PrimitiveTypeConverter,
  StringTypeConverter,
} from './primitive.type.converter'
import { TypeConversionError, TypeConverter } from './type.converter'
import { UrlTypeConverter } from './url.type.converter'
import { UuidTypeConverter } from './uuid.type.converter'

describe('StringTypeValidator', () => {
  let validator: TypeConverter<any>

  beforeEach(() => {
    validator = new StringTypeConverter()
  })
  afterEach(() => {
    validator = undefined
  })

  describe('validate', () => {
    it('passes through string values', () => {
      expect(validator.convert('foo')).to.equal('foo')
    })
  })
})

describe('NumberTypeValidator', () => {
  let validator: TypeConverter<any>

  beforeEach(() => {
    validator = new NumberTypeConverter()
  })
  afterEach(() => {
    validator = undefined
  })

  describe('validate', () => {
    it('converts number values to numbers', () => {
      const result = validator.convert('42')
      expect(result).to.be.a('number')
      expect(result).to.equal(42)
    })

    it('throws an error if the value is not a valid number', () => {
      expect(() => validator.convert('foo')).to.throw(TypeConversionError)
    })
  })
})

describe('BooleanTypeValidator', () => {
  let validator: TypeConverter<any>

  beforeEach(() => {
    validator = new BooleanTypeConverter()
  })
  afterEach(() => {
    validator = undefined
  })

  describe('validate', () => {
    it('passes through boolean values', () => {
      expect(validator.convert(true)).to.be.true
      expect(validator.convert(false)).to.be.false
    })

    it('converts the value 0 to false', () => {
      expect(validator.convert(0)).to.be.false
    })

    it('converts the value 1 to true', () => {
      expect(validator.convert(1)).to.be.true
    })

    it('converts boolean values to booleans', () => {
      expect(validator.convert('true')).to.be.true
      expect(validator.convert('True')).to.be.true
      expect(validator.convert('TRUE')).to.be.true
      expect(validator.convert('false')).to.be.false
      expect(validator.convert('False')).to.be.false
      expect(validator.convert('FALSE')).to.be.false
    })

    it('throws an error if the value is not a valid boolean', () => {
      expect(() => validator.convert('flalse')).to.throw(TypeConversionError)
      expect(() => validator.convert({ foo: 'bar' })).to.throw(TypeConversionError)
    })
  })
})

describe('PrimitiveTypeValidator', () => {
  let validator: PrimitiveTypeConverter
  let bool: SinonStubbedInstance<BooleanTypeConverter>
  let dt: SinonStubbedInstance<DateTimeTypeConverter>
  let num: SinonStubbedInstance<NumberTypeConverter>
  let str: SinonStubbedInstance<StringTypeConverter>
  let url: SinonStubbedInstance<UrlTypeConverter>
  let uuid: SinonStubbedInstance<UuidTypeConverter>

  beforeEach(() => {
    bool = Object.assign(createStubInstance(BooleanTypeConverter), { type: Boolean })
    dt = Object.assign(createStubInstance(DateTimeTypeConverter), { type: DateTime })
    num = Object.assign(createStubInstance(NumberTypeConverter), { type: Number })
    str = Object.assign(createStubInstance(StringTypeConverter), { type: String })
    url = Object.assign(createStubInstance(UrlTypeConverter), { type: Url })
    uuid = Object.assign(createStubInstance(UuidTypeConverter), { type: Uuid })
    validator = new PrimitiveTypeConverter([bool, dt, num, str, url, uuid] as any)
  })
  afterEach(() => {
    bool = undefined
    dt = undefined
    num = undefined
    str = undefined
    url = undefined
    uuid = undefined
    validator = undefined
  })

  it('validates boolean values', () => {
    validator.convert('foo', { type: Boolean })
    expect(bool.convert).to.have.been.calledOnce.calledWithExactly('foo', {
      type: Boolean,
    })
  })

  it('validates DateTime values', () => {
    validator.convert('foo', { type: DateTime })
    expect(dt.convert).to.have.been.calledOnce.calledWithExactly('foo', {
      type: DateTime,
    })
  })

  it('validates numeric values', () => {
    validator.convert('foo', { type: Number })
    expect(num.convert).to.have.been.calledOnce.calledWithExactly('foo', {
      type: Number,
    })
  })

  it('validates string values', () => {
    validator.convert('foo', { type: String })
    expect(str.convert).to.have.been.calledOnce.calledWithExactly('foo', {
      type: String,
    })
  })

  it('validates url values', () => {
    validator.convert('foo', { type: Url })
    expect(url.convert).to.have.been.calledOnce.calledWithExactly('foo', {
      type: Url,
    })
  })

  it('validates uuid values', () => {
    validator.convert('foo', { type: Uuid })
    expect(uuid.convert).to.have.been.calledOnce.calledWithExactly('foo', {
      type: Uuid,
    })
  })

  it('throws an AppError if it does not have a validator for the specified type', () => {
    expect(() => validator.convert('foo', { type: Date })).to.throw(AppError)
  })
})
