import { AppError } from '@dandi/common'
import { getInjectableMetadata } from '@dandi/core/internal/util'
import { getProviderValue, stub } from '@dandi/core/testing'
import { createHttpRequestHandlerScope } from '@dandi/http'
import { HandleModelErrors, RequestModel, RequestModelErrors, RequestModelErrorsMetadata } from '@dandi/http-model'
import { Property } from '@dandi/model'

import { expect } from 'chai'

describe('@HandleModelErrors', () => {

  class TestModel {
    @Property(String)
    public foo: string
  }

  class TestHandler {
    @HandleModelErrors()
    public testMethodValid(
      @RequestModelErrors() errors: RequestModelErrors,
      @RequestModel(TestModel) body: TestModel,
    ): any {
      return { errors, body }
    }
  }

  // This has to be done in a function because unlike the corresponding check in @RequestMethodErrors, the check to make
  // sure that the method has a parameter with @RequestMethodErrors is done immediately when the decorator is invoked.
  // If the InvalidTestHandler class were declared directly in the describe block like TestHandler, the resulting error
  // would prevent the tests from executing at all.
  const declareInvalidHandler = (): any => {
    class InvalidTestHandler {
      // invalid = using @HandleModelErrors without also using @RequestModelErrors
      @HandleModelErrors()
      public testMethodInvalid(
        @RequestModel(TestModel) body: TestModel,
      ): any {
        return { body }
      }
    }
    return InvalidTestHandler
  }

  it('adds the HttpRequestHandler scope', () => {
    const meta = getInjectableMetadata(TestHandler.prototype.testMethodValid)

    expect(meta.scopeFn).to.equal(createHttpRequestHandlerScope)
  })

  it('throws an error when used without @RequestModelErrors on one of the method parameters', () => {
    expect(declareInvalidHandler).to.throw(AppError)
  })

  it('replaces the placeholder RequestModelErrors provider with the real implementation', () => {
    const meta = getInjectableMetadata(TestHandler.prototype.testMethodValid)
    const paramMeta = meta.params.find(paramMeta => paramMeta.token === RequestModelErrors) as RequestModelErrorsMetadata
    const errorsProvider = paramMeta.methodProviders.find(provider => provider.provide === RequestModelErrors)
    const errors = {}
    const collector = { compile: stub().returns(errors) }

    // the placeholder provider would throw when invoked
    const result = getProviderValue(errorsProvider, collector)

    expect(collector.compile).to.have.been.calledOnce
    expect(result).to.equal(errors)
  })

})
