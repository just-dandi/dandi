import { AppError, DateTime, Url, Uuid } from '@dandi/common';

import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance } from 'sinon';

import { DateTimeTypeValidator } from './date.time.type.validator';
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
    it('passes through boolean values', () => {
      expect(validator.validate(true)).to.be.true;
      expect(validator.validate(false)).to.be.false;
    });

    it('converts the value 0 to false', () => {
      expect(validator.validate(0)).to.be.false;
    });

    it('converts the value 1 to true', () => {
      expect(validator.validate(1)).to.be.true;
    });

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
      expect(() => validator.validate({ foo: 'bar' })).to.throw(TypeValidationError);
    });
  });
});

describe('PrimitiveTypeValidator', () => {
  let validator: PrimitiveTypeValidator;
  let bool: SinonStubbedInstance<BooleanTypeValidator>;
  let dt: SinonStubbedInstance<DateTimeTypeValidator>;
  let num: SinonStubbedInstance<NumberTypeValidator>;
  let str: SinonStubbedInstance<StringTypeValidator>;
  let url: SinonStubbedInstance<UrlTypeValidator>;
  let uuid: SinonStubbedInstance<UuidTypeValidator>;

  beforeEach(() => {
    bool = Object.assign(createStubInstance(BooleanTypeValidator), { type: Boolean });
    dt = Object.assign(createStubInstance(DateTimeTypeValidator), { type: DateTime });
    num = Object.assign(createStubInstance(NumberTypeValidator), { type: Number });
    str = Object.assign(createStubInstance(StringTypeValidator), { type: String });
    url = Object.assign(createStubInstance(UrlTypeValidator), { type: Url });
    uuid = Object.assign(createStubInstance(UuidTypeValidator), { type: Uuid });
    validator = new PrimitiveTypeValidator([bool, dt, num, str, url, uuid] as any);
  });
  afterEach(() => {
    bool = undefined;
    dt = undefined;
    num = undefined;
    str = undefined;
    url = undefined;
    uuid = undefined;
    validator = undefined;
  });

  it('validates boolean values', () => {
    validator.validate('foo', { type: Boolean });
    expect(bool.validate).to.have.been.calledOnce.calledWithExactly('foo', {
      type: Boolean,
    });
  });

  it('validates DateTime values', () => {
    validator.validate('foo', { type: DateTime });
    expect(dt.validate).to.have.been.calledOnce.calledWithExactly('foo', {
      type: DateTime,
    });
  });

  it('validates numeric values', () => {
    validator.validate('foo', { type: Number });
    expect(num.validate).to.have.been.calledOnce.calledWithExactly('foo', {
      type: Number,
    });
  });

  it('validates string values', () => {
    validator.validate('foo', { type: String });
    expect(str.validate).to.have.been.calledOnce.calledWithExactly('foo', {
      type: String,
    });
  });

  it('validates url values', () => {
    validator.validate('foo', { type: Url });
    expect(url.validate).to.have.been.calledOnce.calledWithExactly('foo', {
      type: Url,
    });
  });

  it('validates uuid values', () => {
    validator.validate('foo', { type: Uuid });
    expect(uuid.validate).to.have.been.calledOnce.calledWithExactly('foo', {
      type: Uuid,
    });
  });

  it('throws an AppError if it does not have a validator for the specified type', () => {
    expect(() => validator.validate('foo', { type: Date })).to.throw(AppError);
  });
});
