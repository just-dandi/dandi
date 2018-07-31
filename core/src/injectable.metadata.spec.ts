import { expect } from 'chai';

import {
  getInjectableMetadata,
  getInjectableParamMetadata,
  methodTarget,
  MethodTarget,
} from '../';

class TestClass {
  constructor(param1: any, param2: any) {}

  public method(param1: any, param2: any) {}
}

describe('getInjectableMetadata', () => {
  it('initializes metadata with params property that is an empty array', () => {
    const meta = getInjectableMetadata({});
    expect(meta).to.exist;
    expect(meta).to.have.deep.property('params', []);
  });
});

describe('getInjectableParamMetadata', () => {
  describe('for constructors', () => {
    it('initializes the metadata with a list of parameter names', () => {
      getInjectableParamMetadata(methodTarget(TestClass), null, 0);
      const meta = getInjectableMetadata(TestClass);

      expect(meta.paramNames).to.deep.equal(['param1', 'param2']);
    });

    it('initializes the metadata for a constructor parameter', () => {
      const paramMeta = getInjectableParamMetadata(
        methodTarget(TestClass),
        null,
        1,
      );
      paramMeta.optional = true;
      const meta = getInjectableMetadata(TestClass);

      expect(meta.params[1].optional).to.be.true;
    });

    it('returns existing metadata for a constructor parameter', () => {
      const paramMeta = getInjectableParamMetadata(
        methodTarget(TestClass),
        null,
        1,
      );
      paramMeta.optional = true;

      expect(
        getInjectableParamMetadata(methodTarget(TestClass), null, 1).optional,
      ).to.be.true;
    });
  });

  describe('for instance methods', () => {
    let target: MethodTarget<TestClass>;

    beforeEach(() => {
      target = {
        constructor: TestClass,
        method: TestClass.prototype.method,
      };
    });
    afterEach(() => {
      target = undefined;
    });

    it('initializes the metadata with a list of parameter names', () => {
      getInjectableParamMetadata(target, 'method', 0);
      const meta = getInjectableMetadata(TestClass.prototype.method);

      expect(meta.paramNames).to.deep.equal(['param1', 'param2']);
    });

    it('initializes the metadata for an instance method parameter', () => {
      const paramMeta = getInjectableParamMetadata(target, 'method', 1);
      paramMeta.optional = true;
      const meta = getInjectableMetadata(TestClass.prototype.method);

      expect(meta.params[1].optional).to.be.true;
    });

    it('returns existing metadata for an instance method parameter', () => {
      const paramMeta = getInjectableParamMetadata(target, 'method', 1);
      paramMeta.optional = true;

      expect(
        getInjectableParamMetadata(methodTarget(TestClass), null, 1).optional,
      ).to.be.true;
    });
  });
});
