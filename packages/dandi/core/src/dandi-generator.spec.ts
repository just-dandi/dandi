import {
  DandiGenerator,
  getInjectionContext,
  Inject,
  Injectable,
  InjectionToken,
  InjectorContext,
  Optional,
  Provider,
  ProviderTypeError,
  ResolverContext,
  SymbolToken,
} from '@dandi/core'
import { Constructor } from '@dandi/common'
import { AppInjectorContext } from '@dandi/core/testing'

import { expect } from 'chai'
import { stub, spy } from 'sinon'

describe('DandiGenerator', function() {

  @Injectable()
  class TestInjectable {}

  @Injectable()
  class TestWithDependency {
    constructor(@Inject(TestInjectable) public dep: TestInjectable) {}
  }

  @Injectable()
  class DoesNotExist {}

  @Injectable()
  class TestWithMissingOptionalDependency {
    constructor(@Inject(DoesNotExist) @Optional() public dep: DoesNotExist) {}
  }

  beforeEach(function() {
    this.testContext = function TestContext() {}
    this.injector = {
      inject: stub(),
      injectParam: stub(),
    }
    // this.injectorContext = new InjectorContext(undefined, [], undefined, undefined)
    this.generator = new DandiGenerator(this.injector)
    this.appInjectorContext = new AppInjectorContext()
    this.initResolverContext = <T>(target?: InjectionToken<T>, match?: Provider<T>): void => {
      if (match) {
        this.parentInjectorContext = new InjectorContext(this.appInjectorContext, this.testContext, [match])
      }
      this.resolverContext = new ResolverContext<T>(target, this.parentInjectorContext || this.appInjectorContext, this.testContext)
      spy(this.resolverContext, 'addInstance')
      spy(this.resolverContext, 'createChild')
      spy(this.resolverContext, 'createResolverContext')
    }
    this.generate = () => this.generator.generateInstance(this.resolverContext)
    this.register = (...providers: (Provider<any> | Constructor<any>)[]) => this.appInjectorContext.register({ constructor: this.testContext }, ...providers)
  })
  afterEach(function() {
    this.appInjectorContext.dispose('test complete')
    this.parentInjectorContext = undefined
  })

  describe('generateInstance', () => {

    it('returns undefined if the injection context has an undefined match', async function() {

      this.initResolverContext()

      const result = await this.generate()

      expect(result).to.be.undefined

    })

    it('instantiates an injectable class and tracks the instance with the injectorContext', async function() {

      this.initResolverContext(TestInjectable, {
        provide: TestInjectable,
        useClass: TestInjectable,
      })

      const result = await this.generate()

      expect(result).to.exist
      expect(result).to.be.instanceOf(TestInjectable)
      expect(this.resolverContext.addInstance).to.have.been
        .calledOnce
        .calledWithExactly(result)
    })

    it('can instantiate an injectable class with dependencies', async function() {

      this.initResolverContext(TestWithDependency, {
        provide: TestWithDependency,
        useClass: TestWithDependency,
      })
      this.injector.injectParam.resolves(new TestInjectable())

      const result = await this.generate()

      expect(result).to.exist
      expect(result).to.be.instanceOf(TestWithDependency)
      expect(result.dep).to.exist
      expect(result.dep).to.be.instanceof(TestInjectable)
    })

    it('can instantiate an injectable class with missing optional dependencies', async function() {

      this.initResolverContext(TestWithMissingOptionalDependency, {
        provide: TestWithMissingOptionalDependency,
        useClass: TestWithMissingOptionalDependency,
      })
      // this.injector.injectParam.resolves(new TestInjectable())

      const result = await this.generate()

      expect(result).to.exist
      expect(result).to.be.instanceOf(TestWithMissingOptionalDependency)
      expect(result.dep).not.to.exist

    })

    it('instantiates an array of instances for multi providers, using a child injector context for each provider', async function() {

      const token = SymbolToken.for('test')
      const provider1 = {
        provide: token,
        useFactory: () => 1,
        multi: true,
      }
      const provider2 = {
        provide: token,
        useFactory: () => 2,
        multi: true,
      }
      this.register(provider1, provider2)
      this.initResolverContext(token)

      const result = await this.generate()

      expect(result).to.deep.equal([1, 2])
      expect(this.resolverContext.createResolverContext).to.have.been
        .calledTwice
        .calledWithExactly(ResolverContext, token, getInjectionContext(provider1))
        .calledWithExactly(ResolverContext, token, getInjectionContext(provider2))

    })

    it('includes providers specified by a provider when resolving parameters', async function() {

      const token = SymbolToken.for('test')
      const depToken = SymbolToken.for('test-dep')
      const depProvider = {
        provide: depToken,
        useFactory: () => 1,
      }
      const provider = {
        provide: token,
        useFactory: (dep) => ({ dep }),
        deps: [depToken],
        providers: [
          depProvider,
        ],
      }
      this.register(provider)
      this.initResolverContext(token)
      this.injector.injectParam.resolves(depProvider.useFactory())

      const result = await this.generate()

      expect(result).to.deep.equal({ dep: 1 })

    })

    it('creates instances from async factory providers', async function() {

      const token = SymbolToken.for('test')
      const provider = {
        provide: token,
        useFactory: () => new Promise(resolve => setTimeout(resolve.bind(undefined, 1), 0)),
        async: true,
      }
      this.register(provider)
      this.initResolverContext(token)

      const result = await this.generate()

      expect(result).to.equal(1)

    })

    it('returns values from value providers', async function() {

      const token = SymbolToken.for('test')
      const provider = {
        provide: token,
        useValue: 1,
      }
      this.register(provider)
      this.initResolverContext(token)

      const result = await this.generate()

      expect(result).to.equal(1)

    })

    it('throws a ProviderTypeError if the resolved provider is not a supported provider type', async function() {

      const token = SymbolToken.for('test')
      const provider = {
        provide: token,
        useValue: 1,
      }
      this.register(provider)
      delete provider.useValue // contexts won't let you register invalid providers

      this.initResolverContext(token)

      await expect(this.generate()).to.be.rejectedWith(ProviderTypeError)

    })

    describe('singletons', function() {

      it('creates singleton instances from class providers', async function() {

        const provider = {
          provide: TestInjectable,
          useClass: TestInjectable,
          singleton: true,
        }
        this.register(provider)
        this.initResolverContext(TestInjectable)

        const result = await this.generate()

        expect(result).to.exist
        expect(result).to.be.instanceof(TestInjectable)

      })

      it('does not create duplicate instances from singleton providers', async function() {

        const provider = {
          provide: TestInjectable,
          useClass: TestInjectable,
          singleton: true,
        }
        this.register(provider)
        this.initResolverContext(TestInjectable)

        const result1 = await this.generate()
        const result2 = await this.generate()

        expect(result1).to.exist
        expect(result1).to.be.instanceof(TestInjectable)
        expect(result1).to.equal(result2)

      })

      it('does not create duplicate singletons when a second request is made before the first is generated', async function() {

        const generated = []
        const generate = (): TestInjectable => {
          const instance = new TestInjectable()
          generated.push(instance)
          return instance
        }
        let resolve
        const provider = {
          provide: TestInjectable,
          useFactory: () => new Promise(r => resolve = r.bind(undefined, generate())),
          singleton: true,
        }
        this.register(provider)
        this.initResolverContext(TestInjectable)

        // tests the singleton request locking in DandiGenerator.fetchProviderInstance
        const result1 = this.generate()
        const result2 = this.generate()

        resolve()

        expect(await result1).to.exist
        expect(await result1).to.be.instanceof(TestInjectable)
        expect(await result1).to.equal(await result2)
        expect(generated.length).to.equal(1)

      })

    })

  })

})
