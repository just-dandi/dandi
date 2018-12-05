import { Url } from '@dandi/common';
import { testHarness } from '@dandi/core-testing';
import { Required, UrlProperty } from '@dandi/model';
import { ModelBuilderModule } from '@dandi/model-builder';
import { MvcRequest, RequestBody } from '@dandi/mvc';

import { expect } from 'chai';

describe('RequestBodyDecorator', () => {
  class TestModel {
    @UrlProperty()
    @Required()
    public url: Url;
  }
  class TestController {
    public test(@RequestBody(TestModel) body): TestModel {
      return body;
    }
  }
  const req = {
    provide: MvcRequest,
    useFactory() {
      return {
        body: {
          url: 'http://localhost',
        },
      };
    },
  };
  const harness = testHarness(ModelBuilderModule, req);

  let controller: TestController;

  beforeEach(() => {
    controller = new TestController();
  });
  afterEach(() => {
    controller = undefined;
  });

  it('constructs and validates the body', async () => {
    const result = await harness.invoke(controller, controller.test);
    expect(result).to.be.instanceof(TestModel);
    expect(result.url).to.be.instanceof(Url);
  });
});
