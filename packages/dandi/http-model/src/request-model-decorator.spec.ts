import { MethodTarget } from '@dandi/common'
import { Injector, Provider } from '@dandi/core'
import { getInjectableParamMetadata } from '@dandi/core/internal/util'
import { getProviderValue, spy, stub } from '@dandi/core/testing'
import {
  HttpRequestModel,
  HttpRequestModelModelErrorsProvider,
  HttpRequestModelProvider,
  ModelBindingError,
  RequestModel,
  requestModelBuilderResultProvider,
  RequestModelErrorsCollector,
} from '@dandi/http-model'
import { ModelBuilder, ModelBuilderNoThrowOnErrorOptions,  ModelBuilderResult } from '@dandi/model-builder'

import { expect } from 'chai'
import { SinonStubbedInstance } from 'sinon'

describe('@RequestBody', () => {
  it('sets the HttpRequestModel token for the decorated parameter', () => {
    class TestModel {}

    class TestController {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      public method(@RequestModel(TestModel) body: any): void {}
    }

    const meta = getInjectableParamMetadata(TestController.prototype as MethodTarget<TestController>, 'method', 0)

    expect(meta).to.exist
    expect(meta.token).to.equal(HttpRequestModel)
  })

  it('adds a request body provider for the decorated parameter', () => {
    class TestModel {}

    class TestController {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      public method(@RequestModel(TestModel) body: any): void {}
    }

    const meta: RequestModel<TestModel> = getInjectableParamMetadata(
      TestController.prototype as MethodTarget<TestController>,
      'method',
      0,
    )

    expect(meta.methodProviders, 'No meta methodProviders specified').to.exist
    expect(meta.methodProviders.some(provider => provider.provide === HttpRequestModel)).to.exist
  })
})

describe('HttpRequestModelModelErrorsProvider', () => {
  it('returns the errors property from a ModelBuilder object', () => {
    const builderResult = { errors: {} }
    expect(getProviderValue(HttpRequestModelModelErrorsProvider, builderResult)).to.equal(builderResult.errors)
  })
})

describe('HttpRequestModelProvider', () => {
  let injector: SinonStubbedInstance<Injector>
  const getProviderResult = (builderResult: Partial<ModelBuilderResult<any>>): any => {
    return getProviderValue(HttpRequestModelProvider, injector, builderResult)
  }

  beforeEach(() => {
    injector = {
      canResolve: stub(),
    } as SinonStubbedInstance<Injector>
  })

  it('returns undefined if there is no builderResult', () => {
    expect(getProviderResult(undefined)).to.equal(undefined)
    expect(injector.canResolve).not.to.have.been.called
  })

  it('returns the builderValue property without calling canResolve if there are no errors', () => {
    const builderResult = { builderValue: {} }
    expect(getProviderResult(builderResult)).to.equal(builderResult.builderValue)
    expect(injector.canResolve).not.to.have.been.called
  })

  it('returns the builderValue property if there are errors, but a RequestModelErrors provider is present', () => {
    const builderResult = { builderValue: {}, errors: {} }
    injector.canResolve.returns(true)
    expect(getProviderResult(builderResult)).to.equal(builderResult.builderValue)
  })

  it('throws a ModelBindingError if there are errors and not RequestModelErrors provider', () => {
    const builderResult = { builderValue: {}, errors: {} }
    expect(() => getProviderResult(builderResult)).to.throw(ModelBindingError)
  })
})

describe('requestBodyBuilderResultProvider', () => {

  class TestModel {}

  let provider: Provider<ModelBuilderResult<TestModel>>
  let source: any
  let builder: SinonStubbedInstance<ModelBuilder>
  let options: ModelBuilderNoThrowOnErrorOptions
  let collector: RequestModelErrorsCollector
  let builderResult: ModelBuilderResult<TestModel>

  const getProviderResult = (): any => getProviderValue(provider, source, builder, options, collector)

  beforeEach(() => {
    provider = requestModelBuilderResultProvider(TestModel)
    source = {}
    builder = {
      constructMember: stub(),
      constructModel: stub().callsFake(() => builderResult) as any,
    }
    options = { throwOnError: false }
    collector = new RequestModelErrorsCollector()
    spy(collector, 'addBodyErrors')
    builderResult = { source, builderValue: new TestModel(), errors: undefined }
  })

  afterEach(() => {
    provider = undefined
    source = undefined
    builder = undefined
    options = undefined
    collector = undefined
    builderResult = undefined
  })

  it('attempts to build the model', () => {
    getProviderResult()

    expect(builder.constructModel).to.have.been.calledOnceWithExactly(TestModel, source, options)
  })

  it('adds any model errors to the collector', () => {
    builderResult.errors = {}
    getProviderResult()

    expect(collector.addBodyErrors).to.have.been.calledOnceWithExactly(builderResult.errors)
  })

  it('returns the result from constructModel', () => {
    expect(getProviderResult()).to.equal(builderResult)
  })

})
