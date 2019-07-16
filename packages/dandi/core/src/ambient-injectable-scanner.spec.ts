import {
  AmbientInjectableScanner,
  Inject,
  Injectable,
  NoopLogger,
  Repository, Injector,
  Singleton,
} from '@dandi/core'
import { TestHarness, testHarnessSingle } from '@dandi/core/testing'
import { expect } from 'chai'

describe('AmbientInjectableScanner', () => {
  TestHarness.scopeGlobalRepository()

  describe('scan', () => {
    it('returns the providers from the global repository', async () => {
      const scanner = new AmbientInjectableScanner(new NoopLogger())
      await expect(scanner.scan()).to.eventually.deep.equal([...Repository.global.entries()])
    })
  })

  it('includes statically referenced injectables', async () => {
    @Injectable()
    class TestInjectable {}

    const harness = await testHarnessSingle(AmbientInjectableScanner)

    expect((await harness.inject(TestInjectable))).to.be.instanceOf(TestInjectable)
  })

  it('does not create multiple instances of singletons when required by different dependents', async () => {
    @Injectable(Singleton)
    class Singlejon {}
    @Injectable()
    class TestA {
      constructor(@Inject(Singlejon) public jon: Singlejon) {}
    }
    @Injectable()
    class TestB {
      constructor(@Inject(Singlejon) public jon: Singlejon) {}
    }

    const harness = await testHarnessSingle(AmbientInjectableScanner)

    const result1 = await harness.inject(TestA)
    const result2 = await harness.inject(TestB)

    expect(result1.jon).to.equal(result2.jon)

  })

  it('does not create multiple instances of singletons when required by nested dependents', async () => {
    @Injectable(Singleton)
    class Singlejon {}
    @Injectable()
    class TestA {
      constructor(@Inject(Singlejon) public jon: Singlejon) {}
    }
    @Injectable()
    class TestB {
      constructor(@Inject(TestA) public test: TestA, @Inject(Singlejon) public jon: Singlejon) {}
    }

    const harness = await testHarnessSingle(AmbientInjectableScanner)

    const result = await harness.inject(TestB)

    expect(result.jon).to.equal(result.test.jon)

  })

  it('does not create multiple instances of singletons when explicitly resolving', async () => {
    @Injectable(Singleton)
    class Singlejon {}
    @Injectable()
    class Test {
      constructor(@Inject(Singlejon) public jon: Singlejon) {}
    }
    @Injectable()
    class TestFactory {
      constructor(@Inject(Singlejon) public jon: Singlejon, @Inject(Injector) private injector: Injector) {}

      public async createTest(): Promise<Test> {
        return (await this.injector.inject(Test)).singleValue
      }
    }

    const harness = await testHarnessSingle(AmbientInjectableScanner)

    const factory = await harness.inject(TestFactory)
    const test = await factory.createTest()
    expect(factory.jon).to.equal(test.jon)

  })

  it('does not create multiple instances of singletons when invoking', async () => {
    @Injectable(Singleton)
    class Singlejon {}
    @Injectable()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Test {
      constructor(@Inject(Singlejon) public jon: Singlejon) {}
    }
    @Injectable()
    class TestFactory {
      constructor(@Inject(Singlejon) public jon: Singlejon) {}

      public async getJon(@Inject(Singlejon) jon: Singlejon): Promise<Singlejon> {
        return jon
      }
    }

    const harness = await testHarnessSingle(AmbientInjectableScanner)

    const factory = await harness.inject(TestFactory)
    const jon = await harness.invoke(factory, 'getJon')
    expect(jon).to.equal(factory.jon)

  })
})
