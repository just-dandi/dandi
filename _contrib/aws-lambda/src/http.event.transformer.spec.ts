import { stubProvider, testHarness } from '@dandi/core-testing'
import { MetadataModelBuilder, ModelBuilder } from '@dandi/model-builder'
import { APIGatewayProxyEvent, Context } from 'aws-lambda'
import { expect } from 'chai'
import { SinonStubbedInstance, createStubInstance } from 'sinon'

import { MockContext } from '../test/mock.context'

import { DandiAwsLambdaError } from './dandi.aws.lambda.error'
import { HttpEventOptions } from './http.event.options'
import { HttpEventTransformer, HttpHandlerRequest } from './http.event.transformer'
import { LambdaEventTransformer } from './lambda.event.transformer'

class TestBody {
  public foo: string;
}

describe('HttpEventTransformer', () => {
  let transformer: LambdaEventTransformer<APIGatewayProxyEvent, HttpHandlerRequest>
  let body: TestBody
  let event: any
  let context: Context

  beforeEach(() => {
    body = { foo: 'bar ' }
    event = {
      body: JSON.stringify(body),
      headers: 'headers',
      httpMethod: 'httpMethod',
      path: 'path',
      pathParameters: 'pathParameters',
      queryStringParameters: 'queryStringParameters',
      requestContext: 'requestContext',
      resource: 'resource',
      stageVariables: 'stageVariables',
    }
    context = createStubInstance(MockContext)
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

    it('creates a HttpHandlerRequest object using the event values and deserialized body', () => {
      const eventWithoutBody = Object.assign({}, event)
      delete eventWithoutBody.body

      const result = transformer.transform(event, context)

      expect(result).to.include(eventWithoutBody)
      expect(result.body).to.deep.equal(body)
      expect(result.rawBody).to.equal(event.body)
    })

    it('creates a HttpHandlerRequest object using the event values and deserialized base64 encoded body', () => {
      event.body = Buffer.from(event.body, 'utf8').toString('base64')
      event.isBase64Encoded = true

      const eventWithoutBody = Object.assign({}, event)
      delete eventWithoutBody.body
      delete eventWithoutBody.isBase64Encoded

      const result = transformer.transform(event, context)

      expect(result).to.include(eventWithoutBody)
      expect(result.body).to.deep.equal(body)
      expect(result.rawBody).to.equal(event.body)
    })

    it('creates a HttpHandlerRequest object using the event values and no body when none exists', () => {
      delete event.body
      const result = transformer.transform(event, context)

      expect(result).to.include(event)
      expect(result.body).not.to.exist
      expect(result.rawBody).not.to.exist
    })
  })

  describe('with options, no validation', () => {
    const harness = testHarness(HttpEventTransformer, {
      provide: HttpEventOptions,
      useValue: {},
    })

    beforeEach(async () => {
      transformer = await harness.inject(LambdaEventTransformer)
    })
    afterEach(() => {
      transformer = undefined
    })

    it('creates a HttpHandlerRequest object using the event values and deserialized body', () => {
      const eventWithoutBody = Object.assign({}, event)
      delete eventWithoutBody.body

      const result = transformer.transform(event, context)

      expect(result).to.include(eventWithoutBody)
      expect(result.body).to.deep.equal(body)
      expect(result.rawBody).to.equal(event.body)
    })
  })

  describe('with options, validation, no validator', () => {
    const harness = testHarness(HttpEventTransformer, {
      provide: HttpEventOptions,
      useValue: {
        validateBody: String,
      },
    })

    beforeEach(async () => {
      transformer = await harness.inject(LambdaEventTransformer)
    })
    afterEach(() => {
      transformer = undefined
    })

    it('throws a DandiAwsLambdaError', () => {
      expect(() => transformer.transform(event, context)).to.throw(DandiAwsLambdaError)
    })
  })

  describe('body validation', () => {
    const harness = testHarness(HttpEventTransformer, stubProvider(MetadataModelBuilder, ModelBuilder), {
      provide: HttpEventOptions,
      useValue: {
        validateBody: TestBody,
      },
    })

    let builder: SinonStubbedInstance<ModelBuilder>

    beforeEach(async () => {
      transformer = await harness.inject(LambdaEventTransformer)
      builder = await harness.injectStub(ModelBuilder)

      builder.constructModel.returns(body)
    })
    afterEach(() => {
      transformer = undefined
      builder = undefined
    })

    it('validates the body and creates a HttpHandlerRequest object using the event values and deserialized body', () => {
      const eventWithoutBody = Object.assign({}, event)
      delete eventWithoutBody.body

      const result = transformer.transform(event, context)
      expect(builder.constructModel).to.have.been.calledWith(TestBody, body)

      expect(result).to.include(eventWithoutBody)
      expect(result.body).to.deep.equal(body)
      expect(result.rawBody).to.equal(event.body)
    })
  })
})
