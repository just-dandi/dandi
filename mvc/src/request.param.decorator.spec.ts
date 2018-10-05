import { FactoryProvider, getInjectableParamMetadata, methodTarget, SymbolToken } from '@dandi/core';
import { ModelBuilder } from '@dandi/model-builder';
import { expect } from 'chai';

import { PathParam, QueryParam, RequestPathParamMap, RequestQueryParamMap } from '../';

describe('@RequestParam', () => {
  it('sets a token for the decorated parameter', () => {
    class TestController {
      public method(@PathParam(String) foo: string, @QueryParam(String) bar: string): void {}
    }

    const pathMeta = getInjectableParamMetadata(methodTarget(TestController), 'method', 0);
    const queryMeta = getInjectableParamMetadata(methodTarget(TestController), 'method', 1);

    expect(pathMeta).to.exist;
    expect(pathMeta.token).to.exist;
    expect(pathMeta.token).to.be.instanceOf(SymbolToken);
    expect(pathMeta.token.toString()).to.contain(`@dandi/mvc#${RequestPathParamMap}:method:foo`);

    expect(queryMeta).to.exist;
    expect(queryMeta.token).to.exist;
    expect(queryMeta.token).to.be.instanceOf(SymbolToken);
    expect(queryMeta.token.toString()).to.contain(`@dandi/mvc#${RequestQueryParamMap}:method:bar`);
  });

  it('creates a provider to handle validating the param value', () => {
    class TestController {
      public method(@PathParam(String) foo: string, @QueryParam(String) bar: string): void {}
    }

    const pathMeta = getInjectableParamMetadata(methodTarget(TestController), 'method', 0);
    const queryMeta = getInjectableParamMetadata(methodTarget(TestController), 'method', 1);

    expect(pathMeta.providers).to.exist;
    expect(pathMeta.providers).not.to.be.empty;
    expect(pathMeta.providers[0].provide).to.equal(pathMeta.token);
    expect((pathMeta.providers[0] as FactoryProvider<any>).deps).to.include.members([
      ModelBuilder,
      RequestPathParamMap,
    ]);

    expect(queryMeta.providers).to.exist;
    expect(queryMeta.providers).not.to.be.empty;
    expect(queryMeta.providers[0].provide).to.equal(queryMeta.token);
    expect((queryMeta.providers[0] as FactoryProvider<any>).deps).to.include.members([
      ModelBuilder,
      RequestQueryParamMap,
    ]);
  });

  describe('validatorFactory', () => {});
});
