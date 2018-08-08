import { Url } from '@dandi/common';
import { testHarness } from '@dandi/core-testing';
import { Required, UrlProperty } from '@dandi/model';
import { Validation } from '@dandi/model-validation';
import { MvcRequest, RequestBody } from '@dandi/mvc';

// tslint:disable no-unused-expression
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';

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
  const harness = testHarness(Validation, req);

  let controller: TestController;

  beforeEach(() => {
    controller = new TestController();
  });
  afterEach(() => {
    controller = undefined;
  });

  it('validates the body', async () => {
    const result = await harness.invoke(controller, controller.test);
    expect(result).to.be.instanceof(TestModel);
    expect(result.url).to.be.instanceof(Url);
  });
});
