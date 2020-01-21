import { testHarness } from '@dandi/core/testing'
import { HttpRequest } from '@dandi/http'
import { APIGatewayProxyEvent, Context } from 'aws-lambda'

import { expect } from 'chai'
import { createStubInstance } from 'sinon'

import { MockContext } from '../test/mock.context'

import { HttpEventTransformer } from './http-event-transformer'
import { LambdaEventTransformer } from './lambda-event-transformer'

class TestBody {
  public foo: string
}

describe('HttpEventTransformer', () => {
  let transformer: LambdaEventTransformer<APIGatewayProxyEvent>
  let body: TestBody
  let event: any
  let context: Context

  beforeEach(() => {
    body = { foo: 'bar' }
    event = {
      body: JSON.stringify(body),
      headers: 'headers',
      httpMethod: 'get',
      path: 'path',
      pathParameters: {},
      queryStringParameters: {},
      multiValueQueryStringParameters: {},
      requestContext: 'requestContext',
      resource: 'resource',
      stageVariables: 'stageVariables',
    }
    context = createStubInstance(MockContext) as unknown as Context
  })
  afterEach(() => {
    body = undefined
    event = undefined
  })

  describe('basic functionality', () => {
    const harness = testHarness(HttpEventTransformer)

    beforeEach(async () => {
      transformer = await harness.inject(LambdaEventTransformer)
    })
    afterEach(() => {
      transformer = undefined
    })

    it('can be injected as LambdaEventTransformer', () => {
      expect(transformer).to.exist
    })

    it('creates a provider for HttpRequest', () => {
      const result = transformer.transform(event, context)
      const httpProvider = result.find(provider => provider.provide === HttpRequest)

      expect(httpProvider).to.exist
    })

    it('creates an HttpRequest object using the event values', () => {
      const eventWithoutBody = Object.assign({}, event)
      delete eventWithoutBody.body

      const result = transformer.transform(event, context)
      const httpProvider = result.find(provider => provider.provide === HttpRequest)
      const request = (httpProvider as any).useValue

      expect(request.path).to.include(event.path)
      expect(request.body).to.equal(JSON.stringify(body))
    })

    it('creates an HttpRequest object using the event values and the body decoded from base64', () => {
      event.body = Buffer.from(event.body, 'utf8').toString('base64')
      event.isBase64Encoded = true

      const eventWithoutBody = Object.assign({}, event)
      delete eventWithoutBody.body
      delete eventWithoutBody.isBase64Encoded

      const result = transformer.transform(event, context)
      const httpProvider = result.find(provider => provider.provide === HttpRequest)
      const request = (httpProvider as any).useValue

      expect(request.body).to.equal(JSON.stringify(body))
    })

    it('creates a HttpHandlerRequest object using the event values and no body when none exists', () => {
      delete event.body
      const result = transformer.transform(event, context)
      const httpProvider = result.find(provider => provider.provide === HttpRequest)
      const request = (httpProvider as any).useValue

      expect(request.body).not.to.exist
    })
  })

  // describe('with options, no validation', () => {
  //   const harness = testHarness(HttpEventTransformer, {
  //     provide: HttpEventOptions,
  //     useValue: {},
  //   })
  //
  //   beforeEach(async () => {
  //     transformer = await harness.inject(LambdaEventTransformer)
  //   })
  //   afterEach(() => {
  //     transformer = undefined
  //   })
  //
  //   it('creates an HttpRequest object using the event values and deserialized body', () => {
  //     const eventWithoutBody = Object.assign({}, event)
  //     delete eventWithoutBody.body
  //
  //     const result = transformer.transform(event, scope)
  //     const httpProvider = result.find(provider => provider.provide === HttpRequest)
  //     const request = (httpProvider as any).useValue
  //
  //     expect(request.body).to.deep.equal(body)
  //   })
  // })
})
