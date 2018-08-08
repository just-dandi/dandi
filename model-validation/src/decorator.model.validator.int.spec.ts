import { Url } from '@dandi/common';
import { testHarness } from '@dandi/core-testing';
import { Property, UrlProperty } from '@dandi/model';
import { ModelValidator, Validation } from '@dandi/model-validation';

// tslint:disable no-unused-expression
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';

import { DecoratorModelValidator } from './decorator.model.validator';

describe('DecoratorModelValidator', () => {
  const harness = testHarness(Validation);
  let validator: ModelValidator;

  class TestModel {
    @UrlProperty()
    public url: Url;
  }

  class TestModel2 extends TestModel {
    @Property(String)
    public prop: string;
  }

  beforeEach(async () => {
    validator = await harness.inject(ModelValidator);
  });
  afterEach(() => {
    validator = undefined;
  });

  describe('validate', () => {
    it('converts properties to the correct types for a flat class', () => {
      const result = validator.validateModel(TestModel, { url: 'http://foo.bar' });

      expect(result.url).to.be.instanceOf(Url);
    });

    it('converts properties to the correct types for a subclass', () => {
      const result = validator.validateModel(TestModel2, { url: 'http://foo.bar' });

      expect(result.url).to.be.instanceOf(Url);
    });
  });
});
