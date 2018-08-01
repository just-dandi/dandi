import { getInjectableParamMetadata, MethodTarget } from '@dandi/core';
import { expect } from 'chai';

import { HttpRequestBody, RequestBody } from '../';

describe('@HttpRequestBody', () => {
  it('sets the HttpRequestBody token for the decorated parameter', () => {
    class TestModel {}

    class TestController {
      public method(@RequestBody(TestModel) body: any): void {}
    }

    const meta = getInjectableParamMetadata(TestController.prototype as MethodTarget<TestController>, 'method', 0);

    expect(meta).to.exist;
    expect(meta.token).to.equal(HttpRequestBody);
  });

  it('adds a request body provider for the decorated parameter', () => {
    class TestModel {}

    class TestController {
      public method(@RequestBody(TestModel) body: any): void {}
    }

    const meta: RequestBody<TestModel, TestController> = getInjectableParamMetadata(
      TestController.prototype as MethodTarget<TestController>,
      'method',
      0,
    );

    expect(meta.providers).to.exist;
    expect(meta.providers[0].provide).to.equal(HttpRequestBody);
  });
});
