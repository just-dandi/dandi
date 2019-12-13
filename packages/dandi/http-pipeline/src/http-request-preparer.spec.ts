import { Inject, InjectionToken, Provider, SymbolToken } from '@dandi/core'
import { stubHarness, underTest } from '@dandi/core/testing'
import { HttpMethod, HttpRequest } from '@dandi/http'
import { HttpRequestPreparer, HttpRequestPreparerResult, httpRequestPreparerResultProvider } from '@dandi/http-pipeline'

import { expect } from 'chai'

describe('httpRequestPreparerResultProvider', () => {

  const testPreparerProvides = SymbolToken.for('test-preparer-result')
  const dependentTestPreparerProvides = SymbolToken.for('dependent-test-preparer-result')

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
    underTest(TestPreparer),
    underTest(DependentTestPreparer),
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

  beforeEach(async () => {
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
    testPreparerResult = undefined
    dependentTestPreparerResult = undefined

    testPreparerResultToken = undefined
    dependentTestPreparerResultToken = undefined

    testPreparerResultProvider = undefined
    dependentTestPreparerResultProvider = undefined
  })

  it('invokes the preparer when injecting its preparer result token', async () => {
    const result = await harness.inject(testPreparerResultToken, false, testPreparerResultProvider)

    expect(result).to.deep.equal(testPreparerResult)
  })

  it('invokes both preparers when injecting a dependent preparer result token', async () => {
    const result = await harness.inject(dependentTestPreparerResultToken, false, dependentTestPreparerResultProvider)

    expect(result).to.deep.equal(testPreparerResult.concat(dependentTestPreparerResult))
  })

  it('can resolve tokens using prepared providers', async () => {
    const providers = await harness.inject(dependentTestPreparerResultToken, false, dependentTestPreparerResultProvider)
    const result = await harness.inject(testPreparerProvides, false, ...providers)
    const dependentResult = await harness.inject(dependentTestPreparerProvides, false, ...providers)

    expect(result).to.equal('bar')
    expect(dependentResult).to.equal('dependent-bar')
  })

})
