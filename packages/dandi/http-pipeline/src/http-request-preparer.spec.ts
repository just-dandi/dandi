import { Inject, InjectionToken, OpinionatedToken, Provider } from '@dandi/core'
import { stubHarness, TestInjector } from '@dandi/core/testing'
import { HttpMethod, HttpRequest, HttpRequestScope } from '@dandi/http'
import { HttpRequestPreparer, HttpRequestPreparerResult, httpRequestPreparerResultProvider } from '@dandi/http-pipeline'

import { expect } from 'chai'

describe('httpRequestPreparerResultProvider', () => {

  const testPreparerProvides = OpinionatedToken.local('@dandi/http-pipeline/test', 'test-preparer-result', {
    restrictScope: HttpRequestScope,
  })
  // const testPreparerProvides = SymbolToken.for('test-preparer-result')
  // const dependentTestPreparerProvides = SymbolToken.for('dependent-test-preparer-result')
  const dependentTestPreparerProvides = OpinionatedToken.local('@dandi/http-pipeline/test', 'dependent-test-preparer-result', {
    restrictScope: HttpRequestScope,
  })

  @HttpRequestPreparer()
  class TestPreparer implements HttpRequestPreparer {
    public async prepare(): Promise<HttpRequestPreparerResult> {
      return testPreparerResult
    }
  }

  @HttpRequestPreparer(TestPreparer)
  class DependentTestPreparer implements HttpRequestPreparer {

    constructor(@Inject(testPreparerProvides) private testPreparerValue: string) {}

    public async prepare(): Promise<HttpRequestPreparerResult> {
      return dependentTestPreparerResult
    }

  }

  const harness = stubHarness(
    TestPreparer,
    DependentTestPreparer,
    {
      provide: HttpRequest,
      useFactory: () => httpRequest,
    },
  )

  let testPreparerResult: HttpRequestPreparerResult
  let dependentTestPreparerResult: HttpRequestPreparerResult

  let testPreparerResultToken: InjectionToken<HttpRequestPreparerResult>
  let dependentTestPreparerResultToken: InjectionToken<HttpRequestPreparerResult>

  let testPreparerResultProvider: Provider<HttpRequestPreparerResult>
  let dependentTestPreparerResultProvider: Provider<HttpRequestPreparerResult>

  let httpRequest: HttpRequest
  let requestInjector: TestInjector

  beforeEach(async () => {
    requestInjector = harness.createChild(HttpRequestScope)
    httpRequest = {
      body: '',
      params: {},
      path: '/test',
      query: {},
      method: HttpMethod.get,
      get: () => '',
    }

    testPreparerResult = [{ provide: testPreparerProvides, useValue: 'bar' }]
    dependentTestPreparerResult = [{ provide: dependentTestPreparerProvides, useValue: 'dependent-bar' }]

    testPreparerResultToken = HttpRequestPreparerResult(TestPreparer)
    dependentTestPreparerResultToken = HttpRequestPreparerResult(DependentTestPreparer)

    testPreparerResultProvider = httpRequestPreparerResultProvider(TestPreparer)
    dependentTestPreparerResultProvider = httpRequestPreparerResultProvider(DependentTestPreparer)
  })
  afterEach(() => {
    requestInjector = undefined
    httpRequest = undefined

    testPreparerResult = undefined
    dependentTestPreparerResult = undefined

    testPreparerResultToken = undefined
    dependentTestPreparerResultToken = undefined

    testPreparerResultProvider = undefined
    dependentTestPreparerResultProvider = undefined
  })

  it('invokes the preparer when injecting its preparer result token', async () => {
    harness.register(testPreparerResultProvider)
    const result = await requestInjector.inject(testPreparerResultToken)

    expect(result).to.deep.equal(testPreparerResult)
  })

  it('invokes both preparers when injecting a dependent preparer result token', async () => {
    harness.register(dependentTestPreparerResultProvider)
    const result = await requestInjector.inject(dependentTestPreparerResultToken)

    expect(result).to.deep.equal(testPreparerResult.concat(dependentTestPreparerResult))
  })

  it('can resolve tokens using prepared providers', async () => {
    harness.register(dependentTestPreparerResultProvider)
    const providers = await requestInjector.inject(dependentTestPreparerResultToken)
    const preparedInjector = requestInjector.createChild(class PreparedProviders{}, providers)
    const result = await preparedInjector.inject(testPreparerProvides)
    const dependentResult = await preparedInjector.inject(dependentTestPreparerProvides)

    expect(result).to.equal('bar')
    expect(dependentResult).to.equal('dependent-bar')
  })

})
