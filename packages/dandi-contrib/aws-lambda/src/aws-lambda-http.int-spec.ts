import { AwsLambdaHttpModule, LambdaHandler, LambdaHandlerFn, Lambda } from '@dandi-contrib/aws-lambda'
import { APIGatewayProxyEvent } from '@dandi-contrib/aws-lambda/node_modules/@types/aws-lambda'
import { Injectable } from '@dandi/core'
import { HttpHeader, HttpMethod, HttpModule, HttpStatusCode, MimeType } from '@dandi/http'
import { QueryParam, RequestBody } from '@dandi/http-model'
import { HttpPipelineModule } from '@dandi/http-pipeline'
import { Property, Required } from '@dandi/model'
import { ModelBuilderModule } from '@dandi/model-builder'

import { expect } from 'chai'

describe('AWS Lambda Http Events', () => {

  @Injectable()
  class TestGetHandler implements LambdaHandler {

    public handleEvent(@QueryParam(Number) foo: string): any {
      return {
        message: 'hello!',
        foo,
      }
    }

  }

  class TestModel {

    @Property(String)
    @Required()
    public message: string

  }

  @Injectable()
  class TestPostHandler implements LambdaHandler {

    public handleEvent(@RequestBody(TestModel) model: TestModel): any {
      return {
        message: model.message,
      }
    }

  }

  let handler: LambdaHandlerFn

  afterEach(() => {
    handler.dispose('test complete')
    handler = undefined
  })

  describe('GET requests', () => {
    beforeEach(() => {
      handler = Lambda.handler(TestGetHandler, HttpModule, HttpPipelineModule, ModelBuilderModule, AwsLambdaHttpModule)
    })

    it('can handle a simple GET request', async () => {
      const event: APIGatewayProxyEvent = {
        httpMethod: HttpMethod.get,
        headers: {},
        queryStringParameters: {},
        multiValueQueryStringParameters: {},
      } as APIGatewayProxyEvent
      const result = await handler(event, {} as any)

      expect(result).to.deep.equal({
        body: JSON.stringify({ message: 'hello!' }),
        headers: {
          [HttpHeader.contentType]: MimeType.applicationJson,
        },
        statusCode: HttpStatusCode.ok,
      })
    })
  })

  describe('POST requests', () => {

    beforeEach(() => {
      handler = Lambda.handler(TestPostHandler, HttpModule, HttpPipelineModule, ModelBuilderModule, AwsLambdaHttpModule)
    })

    it('can handle a simple POST request', async () => {
      const event: APIGatewayProxyEvent = {
        httpMethod: HttpMethod.post,
        headers: {
          [HttpHeader.contentType]: 'application/json',
        },
        body: JSON.stringify({
          message: 'hi!',
        }),
        queryStringParameters: {},
        multiValueQueryStringParameters: {},
      } as unknown as APIGatewayProxyEvent
      const result = await handler(event, {} as any)

      expect(result).to.deep.equal({
        body: JSON.stringify({ message: 'hi!' }),
        headers: {
          [HttpHeader.contentType]: MimeType.applicationJson,
        },
        statusCode: HttpStatusCode.created,
      })
    })
  })

})
