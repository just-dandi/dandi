import { Inject, Injectable } from '@dandi/core'
import { stubHarnessSingle } from '@dandi/core-testing'
import { expect } from 'chai'

describe('StubResolverContextFactory', () => {

  it('resolves missing dependencies with stub instances', async () => {
    class TestDep {
    }
    @Injectable()
    class TestHost {
      constructor(@Inject(TestDep) public dep: TestDep) {}
    }
    const harness = await stubHarnessSingle(TestHost)
    const host = await harness.inject(TestHost)

    expect(host.dep).not.to.be.undefined
  })

})
