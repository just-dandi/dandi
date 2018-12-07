import { ProviderOptions } from '@dandi/core';
import { RouteTransformer } from '@dandi/mvc';
import { ViewRouteTransformer } from '@dandi/mvc-view';
import { expect } from 'chai';

describe('ViewRouteTransformer', function() {
  beforeEach(function() {
    this.transformer = new ViewRouteTransformer();
  });

  it('is decorated with @Injectable(RouteTransformer)', function() {
    expect(Reflect.get(ViewRouteTransformer, ProviderOptions.valueOf() as symbol).provide).to.equal(RouteTransformer);
  });

  it('adds view metadata if the provided controller method metadata has it', function() {
    const view = { name: 'test' };
    const route = {};
    const result = this.transformer.transform(route, {}, { view });
    expect(result).to.equal(route);
    expect(result.view).to.equal(view);
  });

  it('does not add a view property to the route if there is no view metadata on the controller method metadata', function() {
    const route = {};
    const result = this.transformer.transform(route, {}, {});
    expect(result).to.equal(route);
    expect(result.view).not.to.exist;
  });
});
