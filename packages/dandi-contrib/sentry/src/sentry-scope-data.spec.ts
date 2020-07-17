import { SentryScopeData, SentryScopeDataFragment, SentryScopeDataProvider } from '@dandi-contrib/sentry'
import { testHarness } from '@dandi/core/testing'
import { expect } from 'chai'

describe('SentryScopeDataProvider', () => {
  const harness = testHarness(SentryScopeDataProvider)

  function registerFragment(...fragments: SentryScopeData[]): void {
    const provide = SentryScopeDataFragment
    harness.register(...fragments.map((useValue) => ({ provide, useValue })))
  }

  it('returns an empty object if there are no fragments', async () => {
    expect(await harness.inject(SentryScopeData)).to.deep.equal({})
  })

  it('merges context data from multiple fragments', async () => {
    const context1 = {
      foo: { yes: 'okay' },
      bar: { oh: 'well' },
    }
    const context2 = {
      foo: { hi: 'hello' },
      bar: { right: 'yep' },
    }
    registerFragment({ context: context1 }, { context: context2 })

    expect(await harness.inject(SentryScopeData)).to.deep.equal({
      context: {
        foo: { yes: 'okay', hi: 'hello' },
        bar: { oh: 'well', right: 'yep' },
      },
    })
  })
})
