import {
  AmbientInjectableScanner,
  AsyncFactoryProvider,
  Bootstrapper,
  Container,
  ContainerError,
  ContainerNotInitializedError,
  Inject,
  Injectable,
  InjectionContext,
  MissingProviderError,
  MissingTokenError,
  NoopLogger,
  Optional,
  Provider, Resolver,
  Scanner,
  Singleton,
  SymbolToken,
} from '@dandi/core'
import { TestHarness } from '@dandi/core-testing'

import { expect } from 'chai'
import { spy, stub, createStubInstance } from 'sinon'

import { Repository } from './repository'

describe('Container', function() {
  TestHarness.scopeGlobalRepository()

  beforeEach(function() {
    this.logger = createStubInstance(NoopLogger)
  })

  describe('ctr', () => {
    xit('merges options with defaults', () => {
      // no config right now
    })
  })

  describe('preInit', function() {
    it('does not run more than once', async () => {
      const container = new Container()

      await (container as any).preInit()
      await (container as any).preInit()
    })

    it('registers any providers specified in the constructor configuration', async function() {
      const token1 = new SymbolToken('test-1')
      const token2 = new SymbolToken('test-2')
      const provider1 = {
        provide: token1,
        useValue: {},
      }
      const provider2 = {
        provide: token2,
        useValue: {},
      }
      const container = new Container({
        providers: [provider1, provider2],
      })

      await (container as any).preInit()

      expect((container as any).repository.providers).to.contain.keys([token1, token2])
    })

  describe('init', function() {

    it('runs any scanners registered in the constructor configuration', async function() {
      const repository1 = Repository.for('scanner-1')
      const repository2 = Repository.for('scanner-2')
      const scanner1 = { scan: stub().returns(repository1) }
      const provider1 = {
        provide: Scanner,
        useValue: scanner1,
        multi: true,
      }
      const scanner2 = { scan: stub().returns(repository2) }
      const provider2 = {
        provide: Scanner,
        useValue: scanner2,
        multi: true,
      }

      const container = new Container({
        providers: [provider1, provider2],
      })

      await (container as any).preInit()
      await (container as any).init(this.logger, () => new Date().valueOf())

      const scanners = await container.resolve(Scanner)
      expect(scanners).to.exist

      expect(scanner1.scan).to.have.been.calledOnce
      expect(scanner2.scan).to.have.been.calledOnce

      expect((container as any).repositories).to.include.members([repository1, repository2])
    })
  })
  })

  describe('start', () => {
    it('calls the preInit function', async () => {
      const container = new Container()
      const init = spy(container as any, 'preInit')

      await container.start()

      expect(init).to.have.been.called
    })

    it('throws a ContainerError when called more than once', async () => {
      const container = new Container()
      await container.start()
      await expect(container.start()).to.be.rejectedWith(ContainerError)
    })

    it('resolves and returns the service corresponding with the bootstrap token, if specified', async () => {
      const value = {
        start: stub(),
      }
      const provider = {
        provide: Bootstrapper,
        useFactory: stub().returns(value),
      }
      const container = new Container({ providers: [provider] })

      await container.start()

      expect(provider.useFactory).to.have.been.called
      expect(value.start).to.have.been.called
    })
  })

  describe('resolve', () => {
    @Injectable()
    class TestInjectable {}

    @Injectable()
    class TestWithDependency {
      constructor(@Inject(TestInjectable) public dep: TestInjectable) {}
    }

    it('can instantiate an injectable class', async () => {
      const container = new Container({ providers: [TestInjectable] })
      await container.start()

      const test = (await container.resolve(TestInjectable)).singleValue

      expect(test).to.exist
      expect(test).to.be.instanceOf(TestInjectable)
    })

    it('can instantiate an injectable class with dependencies', async () => {
      const container = new Container({
        providers: [TestInjectable, TestWithDependency],
      })
      await container.start()

      const test = (await container.resolve(TestWithDependency)).singleValue

      expect(test).to.exist
      expect(test).to.be.instanceOf(TestWithDependency)
      expect(test.dep).to.exist
      expect(test.dep).to.be.instanceOf(TestInjectable)
    })

    it('provides the context of the requesting entity', async () => {
      @Injectable()
      class ContextTester {
        constructor(@Inject(InjectionContext) public context: any) {}
      }

      @Injectable()
      class TestInjectable {
        constructor(@Inject(ContextTester) public tester: any) {}
      }

      const container = new Container({
        providers: [ContextTester, TestInjectable],
      })
      await container.start()

      const injectable = (await container.resolve(TestInjectable)).singleValue

      expect(injectable.tester.context).to.equal(TestInjectable)
    })

    it('does not create multiple instances of singletons', async () => {
      let id = 0
      const token = new SymbolToken('test')
      const provider = {
        provide: token,
        useFactory: stub().callsFake(() => {
          id++
          return id
        }),
        singleton: true,
      }
      const container = new Container({ providers: [provider] })
      await container.start()

      const result1 = await container.resolve(token)
      const result2 = await container.resolve(token)

      expect(provider.useFactory).to.have.been.calledOnce
      expect(result1.value).to.equal(1)
      expect(result2.value).to.equal(1)
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

      const container = new Container({ providers: [Singlejon, TestA, TestB] })
      await container.start()

      const result1 = await container.resolve(TestA)
      const result2 = await container.resolve(TestB)

      expect(result1.singleValue.jon).to.equal(result2.singleValue.jon)

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

      const container = new Container({ providers: [Singlejon, Test, TestFactory] })
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

      const container = new Container({ providers: [Singlejon, Test, TestFactory] })
      await container.start()

      const factory = (await container.resolve(TestFactory)).singleValue
      const jon = await container.invoke(factory, factory.getJon)
      expect(jon).to.equal(factory.jon)

    })

    it('can resolve dependencies configured with additional providers on a provider', async () => {
      const token = new SymbolToken('test')
      const dep1 = new SymbolToken('test-dep1')
      const dep2 = new SymbolToken('test-dep2')
      const depProvider1 = {
        provide: dep1,
        useFactory: stub().returns(1),
      }
      const depProvider2 = {
        provide: dep2,
        useFactory: stub().returns(2),
      }
      const provider = {
        provide: token,
        useFactory: stub(),
        deps: [dep1, dep2],
        providers: [depProvider1, depProvider2],
      }
      const container = new Container({ providers: [provider] })
      await container.start()

      await container.resolve(token)

      expect(depProvider1.useFactory).to.have.been.called
      expect(depProvider2.useFactory).to.have.been.called
      expect(provider.useFactory).to.have.been.calledOnce
      expect(provider.useFactory).to.have.been.calledWithExactly(1, 2)
    })

    it('can resolve a value from a factory provider', async () => {
      let id = 0
      const token = new SymbolToken('test')
      const provider = {
        provide: token,
        useFactory: stub().callsFake(() => {
          id++
          return id
        }),
      }
      const container = new Container({ providers: [provider] })
      await container.start()

      const result1 = await container.resolve(token)
      const result2 = await container.resolve(token)

      expect(provider.useFactory).to.have.been.calledTwice
      expect(result1.value).to.equal(1)
      expect(result2.value).to.equal(2)
    })

    it('can resolve a value from an async factory provider', async () => {
      const token = new SymbolToken('test')
      const value = {}
      const provider: AsyncFactoryProvider<any> = {
        provide: token,
        useFactory: stub().callsFake(() => Promise.resolve(value)),
        async: true,
      }
      const container = new Container({ providers: [provider] })
      await container.start()

      expect((await container.resolve(token)).value).to.equal(value)
      expect(provider.useFactory).to.have.been.called
    })

    it('can resolve constructor parameters', async () => {
      @Injectable()
      class TestParam {}

      @Injectable()
      class TestConstructorParams {
        constructor(@Inject(TestParam) public param: TestParam) {}
      }

      const container = new Container({
        providers: [TestConstructorParams, TestParam],
      })
      await container.start()

      const result = await container.resolve(TestConstructorParams)
      expect(result.value).to.be.instanceOf(TestConstructorParams)
      expect(result.singleValue.param).to.exist
      expect(result.singleValue.param).to.be.instanceOf(TestParam)
    })

    it('can passes null values for optional parameters with no providers', async () => {
      class TestParam {}

      @Injectable()
      class TestConstructorParams {
        constructor(
          @Inject(TestParam)
          @Optional()
          public param: TestParam,
        ) {}
      }

      const container = new Container({ providers: [TestConstructorParams] })
      await container.start()

      const result = await container.resolve(TestConstructorParams)
      expect(result.value).to.be.instanceOf(TestConstructorParams)
      expect(result.singleValue.param).to.be.undefined
    })

    it('can resolve constructor parameters whose providers define their own providers', async () => {
      const token = new SymbolToken('test')
      const dep1 = new SymbolToken('test-dep1')
      const dep2 = new SymbolToken('test-dep2')
      const depProvider1 = {
        provide: dep1,
        useFactory: stub().returns(1),
      }
      const depProvider2 = {
        provide: dep2,
        useFactory: stub().returns(2),
      }
      const provider = {
        provide: token,
        useFactory: stub().callsFake((a, b) => new TestParam([a, b])),
        deps: [dep1, dep2],
        providers: [depProvider1, depProvider2],
      }

      class TestParam {
        constructor(public args: number[]) {}
      }

      @Injectable()
      class TestConstructorParams {
        constructor(@Inject(token) public param: any) {}
      }

      const container = new Container({
        providers: [provider, TestConstructorParams] as Array<Provider<any>>,
      })
      await container.start()

      const result = await container.resolve(TestConstructorParams)
      expect(result.value).to.be.instanceOf(TestConstructorParams)
      expect(result.singleValue.param).to.exist
      expect(result.singleValue.param).to.be.instanceOf(TestParam)
      expect(result.singleValue.param.args).to.deep.equal([1, 2])
    })

    it('does not leak token providers outside of resolving the token', async () => {
      const token = new SymbolToken('test')
      const dep = new SymbolToken('test-dep')
      const depProvider = {
        provide: dep,
        useFactory: stub().returns(1),
      }
      const provider = {
        provide: token,
        useFactory: stub(),
        deps: [dep],
        providers: [depProvider],
      }
      const container = new Container({ providers: [provider] })
      await container.start()

      await container.resolve(provider.provide)
      const result = await container.resolve(depProvider.provide, true)
      expect(result).not.to.exist
    })

    it('throws an error if there is no provider for the token and optional is not true', async () => {
      const token = new SymbolToken('test')
      const container = new Container()
      await container.start()

      await expect(container.resolve(token)).to.be.rejectedWith(MissingProviderError)
    })

    it('can resolve singletons from class providers', async () => {
      class TestToken {}

      class TestClass {}

      const provider = {
        provide: TestToken,
        useClass: TestClass,
        singleton: true,
      }

      const container = new Container({ providers: [provider] })
      await container.start()
      const result = await container.resolve(TestToken)
      expect(result).to.exist
      expect(result.singleValue).to.be.instanceOf(TestClass)

      const secondResult = await container.resolve(TestToken)
      expect(secondResult.singleValue).to.equal(result.singleValue)
    })

    it('can resolve singletons discovered on the global/ambient repository', async () => {
      @Injectable(Singleton)
      class TestClass {}

      const container = new Container({ providers: [AmbientInjectableScanner] })
      await container.start()

      const result1 = await container.resolve(TestClass)
      const result2 = await container.resolve(TestClass)

      expect(result1.value).to.be.instanceof(TestClass)
      expect(result1.value).to.equal(result2.value)
    })

    it('throws a ContainerNotInitializedError if called before being initialized', async () => {
      class TestToken {}

      const container = new Container()
      await expect(container.resolve(TestToken)).to.be.rejectedWith(ContainerNotInitializedError)
    })

    it('throws a MissingTokenError if called without a valid injection token', async () => {
      const container = new Container()
      await container.start()
      await expect(container.resolve(null)).to.be.rejectedWith(MissingTokenError)
    })
  })

  describe('invoke/invokeInContext', () => {
    it('throws a ContainerNotInitializedError if called before init', async () => {
      class TestClass {
        public method() {}
      }

      const container = new Container()
      const instance = new TestClass()
      await expect(container.invoke(instance, instance.method)).to.be.rejectedWith(ContainerNotInitializedError)
    })

    it('can invoke methods that have been decorated with @Inject', async () => {
      const token1 = new SymbolToken('test-1')
      const token2 = new SymbolToken('test2')
      const provider1 = {
        provide: token1,
        useValue: 'foo',
      }
      const provider2 = {
        provide: token2,
        useValue: 'bar',
      }
      const method = stub()

      class TestClass {
        public method(@Inject(token1) a: any, @Inject(token2) b: any) {
          // trying to spy on this mucks up Reflection, so just do it manually
          method(a, b)
        }
      }

      const container = new Container({ providers: [provider1, provider2] })
      await container.start()
      const instance = new TestClass()
      await container.invoke(instance, instance.method)
      expect(method).to.have.been.called
      expect(method).to.have.been.calledWith('foo', 'bar')
    })

    it('can invoke methods with optional params', async () => {
      const token1 = new SymbolToken('test-1')
      const token2 = new SymbolToken('test2')
      const provider1 = {
        provide: token1,
        useValue: 'foo',
      }
      const method = stub()

      class TestClass {
        public method(
          @Inject(token1) a: any,
          @Optional()
          @Inject(token2)
          b: any,
        ) {
          // trying to spy on this mucks up Reflection, so just do it manually
          method(a, b)
        }
      }

      const container = new Container({ providers: [provider1] })
      await container.start()
      const instance = new TestClass()
      await container.invoke(instance, instance.method)
      expect(method).to.have.been.called
      expect(method).to.have.been.calledWith('foo', undefined)
    })
  })
})
