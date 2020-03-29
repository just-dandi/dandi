import { AppError } from '@dandi/common'
import { FactoryProvider } from '@dandi/core'
import { getInjectableMetadata, InjectableMetadata } from '@dandi/core/internal/util'
import { createStubInstance, getProviderValue } from '@dandi/core/testing'
import {
  HandleModelErrors,
  QueryParam,
  RequestModel,
  RequestModelErrors,
  RequestModelErrorsMetadata,
} from '@dandi/http-model'
import { Property } from '@dandi/model'

import { expect } from 'chai'
import { SinonStubbedInstance } from 'sinon'

import { RequestModelErrorsCollector } from './request-model-errors-collector'

describe('@RequestModelErrors', () => {

  class TestModel {
    @Property(String)
    public foo: string
  }

  class TestHandler {
    @HandleModelErrors()
    public testMethodValid(
      @QueryParam(String) something: string,
      @RequestModelErrors() errors: RequestModelErrors,
      @RequestModel(TestModel) body: TestModel,
    ): any {
      return { something, errors, body }
    }

    // invalid = using @RequestModelErrors without also using @HandleModelErrors
    public testMethodInvalid(
      @RequestModelErrors() errors: RequestModelErrors,
      @RequestModel(TestModel) body: TestModel,
    ): any {
      return { errors, body }
    }
  }

  let collector: SinonStubbedInstance<RequestModelErrorsCollector>

  let validMeta: InjectableMetadata
  let invalidMeta: InjectableMetadata

  let validErrorsParamMeta: RequestModelErrorsMetadata
  let invalidErrorsParamMeta: RequestModelErrorsMetadata

  beforeEach(() => {
    collector = createStubInstance(RequestModelErrorsCollector)

    validMeta = getInjectableMetadata(TestHandler.prototype.testMethodValid)
    invalidMeta = getInjectableMetadata(TestHandler.prototype.testMethodInvalid)

    validErrorsParamMeta = validMeta.params
      .find(param => param.token === RequestModelErrors) as RequestModelErrorsMetadata
    invalidErrorsParamMeta = invalidMeta.params
      .find(param => param.token === RequestModelErrors) as RequestModelErrorsMetadata
  })
  afterEach(() => {
    collector = undefined

    validMeta = undefined
    invalidMeta = undefined

    validErrorsParamMeta = undefined
    invalidErrorsParamMeta = undefined
  })

  describe('sanity check', () => {
    it('TestHandler.testValidMethod has parameters before and after the RequestModelErrors param', () => {
      const errorsParamIndex = validMeta.params.indexOf(validErrorsParamMeta)

      const beforeMsg = 'TestHandler.testValidMethod has no parameters before the RequestModelErrors param'
      expect(errorsParamIndex, beforeMsg).to.be.greaterThan(0)

      const afterMsg = 'TestHandler.testValidMethod has no parameters after the RequestModelErrors param'
      expect(errorsParamIndex, afterMsg).to.be.lessThan(validMeta.params.length - 1)
    })
  })

  it('sets RequestModelErrors as the injection token for the parameter', () => {
    expect(validErrorsParamMeta).to.exist
  })

  it('adds a factory method to create a RequestModelErrors provider', () => {
    expect(validErrorsParamMeta.createRequestModelErrorsProvider).to.exist
    expect(validErrorsParamMeta.createRequestModelErrorsProvider).to.be.a('function')
  })

  it('adds a placeholder RequestModelErrors provider as a methodProviders', () => {
    expect(validErrorsParamMeta.methodProviders).to.exist
    expect(invalidErrorsParamMeta.methodProviders).to.exist
  })

  it('throws an error when invoking the placeholder RequestModelErrors provider', () => {
    // this happens when using @RequestModelErrors on a param without also using @HandleModelErrors on the method
    const errorsProvider =
      invalidErrorsParamMeta.methodProviders.find(provider => provider.provide === RequestModelErrors)
    expect(errorsProvider).to.exist
    expect(() => getProviderValue(errorsProvider, collector)).to.throw(AppError)
  })

  describe('requestModelErrorsProvider', () => {

    let errorsProvider: FactoryProvider<RequestModelErrors>

    beforeEach(() => {
      errorsProvider = validErrorsParamMeta.methodProviders
        .find(provider => provider.provide === RequestModelErrors) as FactoryProvider<RequestModelErrors>
    })
    afterEach(() => {
      errorsProvider = undefined
    })

    it('includes the injectable tokens of its sibling parameters as provider dependencies', () => {
      // ensures that any other providers that contribute to RequestModelErrors have been executed first
      expect(errorsProvider.deps).to.exist
      expect(errorsProvider.deps).to.include(RequestModelErrorsCollector)
      expect(errorsProvider.deps).not.to.include(RequestModelErrors)
      const siblingParams = validMeta.params.filter(param => param.name !== 'errors')
      expect(errorsProvider.deps).to.include.members(siblingParams.map(siblingParams => siblingParams.token))
    })

    it('returns the result of RequestModelErrorsCollector.compile()', () => {
      const compileResult = {}
      collector.compile.returns(compileResult)

      expect(getProviderValue(errorsProvider, collector)).to.equal(compileResult)
    })

  })

})
