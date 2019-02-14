import { Inject, Injectable } from '@dandi/core'
import { stubHarness, stubHarnessSingle } from '@dandi/core-testing'

import { expect } from 'chai'

describe('StubResolverContextFactory (stubHarnessSingle)', () => {

  it('resolves missing dependencies with stub instances', async () => {
    class TestDep {
    }
    @Injectable()
    class TestHost {
      constructor(@Inject(TestDep) public dep: TestDep) {}
    }
    const harness = await stubHarnessSingle(TestHost)
    const host = await harness.inject(TestHost)

    expect(host.dep).to.be.instanceof(TestDep)
  })

})

describe('StubResolverContextFactory (stubHarness)', () => {

  class TestDepA {
  }
  class TestDepB {
  }
  @Injectable()
  class TestHost {
    constructor(@Inject(TestDepA) public depA: TestDepA, @Inject(TestDepB) public depB: TestDepB) {}
  }
  const harness = stubHarness(TestHost)

  it('resolves missing dependencies with stub instances', async () => {
    const host = await harness.inject(TestHost)

    expect(host.depA).to.be.instanceof(TestDepA)
  })

  it('continues working on a subsequent test', async () => {
    const host = await harness.inject(TestHost)

    expect(host.depA).to.be.instanceof(TestDepA)
  })

  it('injects the correct dependencies', async () => {
    const host = await harness.inject(TestHost)

    expect(host.depA).to.be.instanceof(TestDepA)
    expect(host.depB).to.be.instanceof(TestDepB)
  })

})
