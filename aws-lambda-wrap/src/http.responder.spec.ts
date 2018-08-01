import { stubProvider, testHarness } from '@dandi/core-testing';
import { APIGatewayProxyResult } from 'aws-lambda';

import { expect } from 'chai';

import { HttpEventOptions } from './http.event.options';
import { HttpResponder } from './http.responder';
import { HttpResponseInterceptor } from './http.response.interceptor';
import { LambdaResponder } from './lambda.responder';

describe('HttpResponder', () => {
  let responder: LambdaResponder<any>;
  let response: any;

  beforeEach(() => {
    response = { foo: 'bar' };
  });
  afterEach(() => {
    response = undefined;
    responder = undefined;
  });

  describe('basic usage', () => {
    const harness = testHarness(HttpResponder);

    beforeEach(async () => {
      responder = await harness.inject(LambdaResponder);
    });

    describe('handleResponse', () => {
      it('resolves with an APIGatewayProxyResult with a 200 status code and a stringified body', async () => {
        const result = await responder.handleResponse(response);
        expect(result).to.deep.equal({
          statusCode: 200,
          body: JSON.stringify(response),
        });
      });

      it('resolves a APIGatewayProxyResult with a 200 status code and an undefined body if the response is undefined or null', async () => {
        const undefResult = await responder.handleResponse(undefined);
        expect(undefResult).to.deep.equal({
          statusCode: 200,
          body: undefined,
        });

        const nullResult = await responder.handleResponse(null);
        expect(nullResult).to.deep.equal({
          statusCode: 200,
          body: undefined,
        });
      });
    });

    describe('handleError', () => {
      it('resolves with an APIGatewayProxyResult with a 500 status code and a stringified body containing the message and stack of the error', async () => {
        const error = new Error('Your llama is lloose!');
        const result = await responder.handleError(error);
        expect(result).to.deep.equal({
          statusCode: 500,
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
          }),
        });
      });

      it('resolves with an APIGatewayProxyResult with the status code provided by the error and a stringified body containing the message and stack of the error', async () => {
        const error = new Error('Your llama is lloose!');
        (error as any).statusCode = 404;
        const result = await responder.handleError(error);
        expect(result).to.deep.equal({
          statusCode: 404,
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
          }),
        });
      });
    });
  });

  describe('with interceptors', () => {
    class TestResponseInterceptor implements HttpResponseInterceptor {
      public exec(res: APIGatewayProxyResult): void {}
    }

    const harness = testHarness(HttpResponder, stubProvider(TestResponseInterceptor, HttpResponseInterceptor));

    let interceptor: HttpResponseInterceptor;

    beforeEach(async () => {
      responder = await harness.inject(LambdaResponder);
      interceptor = (await harness.injectStub(HttpResponseInterceptor))[0];
    });
    afterEach(() => {
      interceptor = undefined;
    });

    describe('handleResponse', () => {
      it('invokes any HttpResponseInterceptors', async () => {
        await responder.handleResponse(response);

        expect(interceptor.exec).to.have.been.calledOnce.calledWithExactly({
          statusCode: 200,
          body: JSON.stringify(response),
        });
      });
    });

    describe('handleError', () => {
      it('invokes any HttpResponseInterceptors', async () => {
        const error = new Error('Your llama is lloose!');
        await responder.handleError(error);

        expect(interceptor.exec).to.have.been.calledOnce.calledWithExactly({
          statusCode: 500,
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
          }),
        });
      });
    });
  });

  describe('status code options', () => {
    const harness = testHarness(HttpResponder, {
      provide: HttpEventOptions,
      useValue: {
        successStatusCode: 201,
        errorStatusCode: 501,
      },
    });

    beforeEach(async () => {
      responder = await harness.inject(LambdaResponder);
    });

    describe('handleResponse', () => {
      it('resolves with an APIGatewayProxyResult with the provided success status code and a stringified body', async () => {
        const result = await responder.handleResponse(response);
        expect(result).to.deep.equal({
          statusCode: 201,
          body: JSON.stringify(response),
        });
      });
    });

    describe('handleError', () => {
      it('resolves with an APIGatewayProxyResult with the provided error status code and a stringified body containing the message and stack of the error', async () => {
        const error = new Error('Your llama is lloose!');
        const result = await responder.handleError(error);
        expect(result).to.deep.equal({
          statusCode: 501,
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
          }),
        });
      });

      it('resolves with an APIGatewayProxyResult with the status code provided by the error and a stringified body containing the message and stack of the error', async () => {
        const error = new Error('Your llama is lloose!');
        (error as any).statusCode = 404;
        const result = await responder.handleError(error);
        expect(result).to.deep.equal({
          statusCode: 404,
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
          }),
        });
      });
    });
  });
});
