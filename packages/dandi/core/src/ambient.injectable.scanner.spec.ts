import {
  AmbientInjectableScanner,
  Container,
  Inject,
  Injectable,
  NoopLogger,
  Repository, Resolver,
  Singleton,
} from '@dandi/core'
import { TestHarness } from '@dandi/core-testing'
import { expect } from 'chai'

describe('AmbientInjectableScanner', () => {
  TestHarness.scopeGlobalRepository()

  describe('scan', () => {
    it('returns the global repository', async () => {
      const scanner = new AmbientInjectableScanner(new NoopLogger())
      await expect(scanner.scan()).to.eventually.equal(Repository.global)
    })
  })

  it('includes statically referenced injectables', async () => {
    @Injectable()
    class TestInjectable {}

    const container = new Container({ providers: [AmbientInjectableScanner] })
    await container.start()

    expect((await container.resolve(TestInjectable)).value).to.be.instanceOf(TestInjectable)
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

    const container = new Container({ providers: [AmbientInjectableScanner] })
    await container.start()

    const result1 = await container.resolve(TestA)
    const result2 = await container.resolve(TestB)

    expect(result1.singleValue.jon).to.equal(result2.singleValue.jon)

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

    const container = new Container({ providers: [AmbientInjectableScanner] })
    await container.start()

    const result = await container.resolve(TestB)

    expect(result.singleValue.jon).to.equal(result.singleValue.test.jon)

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
      constructor(@Inject(Singlejon) public jon: Singlejon, @Inject(Resolver) private resolver: Resolver) {}

      public async createTest(): Promise<Test> {
        return (await this.resolver.resolve(Test)).singleValue
      }
    }

    const container = new Container({ providers: [AmbientInjectableScanner] })
    await container.start()

    const factory = (await container.resolve(TestFactory)).singleValue
    const test = await factory.createTest()
    expect(factory.jon).to.equal(test.jon)

  })

  it('does not create multiple instances of singletons when invoking', async () => {
    @Injectable(Singleton)
    class Singlejon {}
    @Injectable()
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

    const container = new Container({ providers: [AmbientInjectableScanner] })
    await container.start()

    const factory = (await container.resolve(TestFactory)).singleValue
    const jon = await container.invoke(factory, factory.getJon)
    expect(jon).to.equal(factory.jon)

  })
})
