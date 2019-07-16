import { MethodTarget } from '@dandi/common'
import { FactoryProvider, getInjectableParamMetadata } from '@dandi/core'
import { ModelBuilder } from '@dandi/model-builder'
import { expect } from 'chai'
import { SinonStubbedInstance, stub } from 'sinon'

import { HttpRequestBody, ModelBindingError, RequestBody, requestBodyProvider } from '../'

describe('@HttpRequestBody', () => {
  it('sets the HttpRequestBody token for the decorated parameter', () => {
    class TestModel {}

    class TestController {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      public method(@RequestBody(TestModel) body: any): void {}
    }

    const meta = getInjectableParamMetadata(TestController.prototype as MethodTarget<TestController>, 'method', 0)

    expect(meta).to.exist
    expect(meta.token).to.equal(HttpRequestBody)
  })

  it('adds a request body provider for the decorated parameter', () => {
    class TestModel {}

    class TestController {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      public method(@RequestBody(TestModel) body: any): void {}
    }

    const meta: RequestBody<TestModel, TestController> = getInjectableParamMetadata(
      TestController.prototype as MethodTarget<TestController>,
      'method',
      0,
    )

    expect(meta.providers).to.exist
    expect(meta.providers[0].provide).to.equal(HttpRequestBody)
  })
})

describe('requestBodyProvider', () => {
  class Foo {}

  let provider: FactoryProvider<any>
  let validator: SinonStubbedInstance<ModelBuilder>

  beforeEach(() => {
    provider = requestBodyProvider(Foo) as FactoryProvider<any>
    validator = {
      constructMember: stub(),
      constructModel: stub(),
    }
  })
  afterEach(() => {
    provider = undefined
    validator = undefined
  })

  it('returns undefined if the request has no body', () => {
    const req: any = {}

    const result = provider.useFactory(req, validator)

    expect(result).to.be.undefined
  })

  it('validates the body if it exists', () => {
    const req: any = { body: {} }
    validator.constructModel.returns(req.body)

    expect(provider.useFactory(req, validator)).to.equal(req.body)
  })

  it('throws a ModelBindingError if model validation fails', () => {
    const req: any = { body: {} }
    validator.constructModel.throws(new Error('Your llama is lloose!'))

    expect(() => provider.useFactory(req, validator)).to.throw(ModelBindingError)
  })
})
