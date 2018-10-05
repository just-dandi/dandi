import { Url } from '@dandi/common';
import { testHarness } from '@dandi/core-testing';
import { Property, UrlProperty } from '@dandi/model';
import { DecoratorModelBuilder, ModelBuilder, Validation } from '@dandi/model-builder';

import { expect } from 'chai';

describe('DecoratorModelBuilder', () => {
  const harness = testHarness(Validation);
  let builder: ModelBuilder;

  class TestModel {
    @UrlProperty()
    public url: Url;
  }

  class TestModel2 extends TestModel {
    @Property(String)
    public prop: string;
  }

  beforeEach(async () => {
    builder = await harness.inject(ModelBuilder);
  });
  afterEach(() => {
    builder = undefined;
  });

  describe('validate', () => {
    it('converts properties to the correct types for a flat class', () => {
      const result = builder.constructModel(TestModel, { url: 'http://foo.bar' });

      expect(result.url).to.be.instanceOf(Url);
    });

    it('converts properties to the correct types for a subclass', () => {
      const result = builder.constructModel(TestModel2, { url: 'http://foo.bar' });

      expect(result.url).to.be.instanceOf(Url);
    });
  });
});
