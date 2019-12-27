import {
  DandiGenerator,
  DandiInjector,
  getInjectionScope,
  Inject,
  Injectable,
  InjectionToken, Injector,
  InjectorContext,
  Optional,
  Provider,
  ProviderTypeError,
  ResolverContext,
  SymbolToken,
  Registerable,
} from '@dandi/core'
import { RootInjectorContext } from '@dandi/core/src/root-injector-context'

import { expect } from 'chai'
import { spy, SinonStubbedInstance, createStubInstance } from 'sinon'

describe('DandiGenerator', () => {

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

  let rootInjectorContext: RootInjectorContext
  let parentInjectorContext: InjectorContext
  let injector: SinonStubbedInstance<Injector>
  let generator: DandiGenerator
  let resolverContext: ResolverContext

  function initResolverContext<T>(target?: InjectionToken<T>, match?: Provider<T>): void {
    if (match) {
      parentInjectorContext = rootInjectorContext.createChild('because', match)
      spy(parentInjectorContext, 'createChild')
    }
    resolverContext = new ResolverContext<T>(target, parentInjectorContext || rootInjectorContext)
    spy(resolverContext, 'addInstance')
  }
  const generate = (): any => generator.generateInstance(injector as unknown as Injector, resolverContext)
  const register = (...providers: Registerable[]): any => rootInjectorContext.register('Test', ...providers)
  const injectorStub = (): SinonStubbedInstance<Injector> => {
    const instance = createStubInstance(DandiInjector)
    instance.createResolverContext.callsFake((token: InjectionToken<any>) => {
      return new ResolverContext(token, parentInjectorContext || rootInjectorContext)
    })
    instance.createChild.callsFake(() => injectorStub() as unknown as DandiInjector)
    return instance
  }
  beforeEach(() => {
    injector = injectorStub()
    rootInjectorContext = new RootInjectorContext()
    generator = new DandiGenerator()

  })
  afterEach(() => {
    rootInjectorContext.dispose('test complete')
    parentInjectorContext = undefined
  })

  describe('generateInstance', () => {

    it('returns undefined if the injection scope has an undefined match', async () => {

      initResolverContext()

      const result = await generate()

      expect(result).to.be.undefined

    })

    it('instantiates an injectable class and tracks the instance with the injectorContext', async () => {

      initResolverContext(TestInjectable, {
        provide: TestInjectable,
        useClass: TestInjectable,
      })

      const result = await generate()

      expect(result).to.exist
      expect(result).to.be.instanceOf(TestInjectable)
      expect(resolverContext.addInstance).to.have.been
        .calledOnce
        .calledWithExactly(result)
    })

    it('can instantiate an injectable class with dependencies', async () => {

      initResolverContext(TestWithDependency, {
        provide: TestWithDependency,
        useClass: TestWithDependency,
      })
      injector.injectParam.resolves(new TestInjectable())

      const result = await generate()

      expect(result).to.exist
      expect(result).to.be.instanceOf(TestWithDependency)
      expect(result.dep).to.exist
      expect(result.dep).to.be.instanceof(TestInjectable)
    })

    it('can instantiate an injectable class with missing optional dependencies', async () => {

      initResolverContext(TestWithMissingOptionalDependency, {
        provide: TestWithMissingOptionalDependency,
        useClass: TestWithMissingOptionalDependency,
      })
      // rootInjector.injectParam.resolves(new TestInjectable())

      const result = await generate()

      expect(result).to.exist
      expect(result).to.be.instanceOf(TestWithMissingOptionalDependency)
      expect(result.dep).not.to.exist

    })

    it('instantiates an array of instances for multi providers, using a child injector for each provider', async () => {

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
      register(provider1, provider2)
      initResolverContext(token)

      const result = await generate()

      expect(result).to.deep.equal([1, 2])
      expect(injector.createChild).to.have.been
        .calledTwice
        .calledWithExactly(getInjectionScope(provider1))
        .calledWithExactly(getInjectionScope(provider2))

    })

    it('includes providers specified by a provider when resolving parameters', async () => {

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
      register(provider)
      initResolverContext(token)
      injector.injectParam.resolves(depProvider.useFactory())

      const result = await generate()

      expect(result).to.deep.equal({ dep: 1 })

    })

    it('creates instances from async factory providers', async () => {

      const token = SymbolToken.for('test')
      const provider = {
        provide: token,
        useFactory: () => new Promise(resolve => setTimeout(resolve.bind(undefined, 1), 0)),
        async: true,
      }
      register(provider)
      initResolverContext(token)

      const result = await generate()

      expect(result).to.equal(1)

    })

    it('returns values from value providers', async () => {

      const token = SymbolToken.for('test')
      const provider = {
        provide: token,
        useValue: 1,
      }
      register(provider)
      initResolverContext(token)

      const result = await generate()

      expect(result).to.equal(1)

    })

    it('throws a ProviderTypeError if the resolved provider is not a supported provider type', async () => {

      const token = SymbolToken.for('test')
      const provider = {
        provide: token,
        useValue: 1,
      }
      register(provider)
      delete provider.useValue // contexts won't let you register invalid providers

      initResolverContext(token)

      await expect(generate()).to.be.rejectedWith(ProviderTypeError)

    })

    describe('singletons', () => {

      it('creates singleton instances from class providers', async () => {

        const provider = {
          provide: TestInjectable,
          useClass: TestInjectable,
          singleton: true,
        }
        register(provider)
        initResolverContext(TestInjectable)

        const result = await generate()

        expect(result).to.exist
        expect(result).to.be.instanceof(TestInjectable)

      })

      it('does not create duplicate instances from singleton providers', async () => {

        const provider = {
          provide: TestInjectable,
          useClass: TestInjectable,
          singleton: true,
        }
        register(provider)
        initResolverContext(TestInjectable)

        const result1 = await generate()
        const result2 = await generate()

        expect(result1).to.exist
        expect(result1).to.be.instanceof(TestInjectable)
        expect(result1).to.equal(result2)

      })

      it('does not create duplicate singletons when a second request is made before the first is generated', async () => {

        const generated = []
        const generateInjectable = (): TestInjectable => {
          const instance = new TestInjectable()
          generated.push(instance)
          return instance
        }
        let resolve
        const provider = {
          provide: TestInjectable,
          useFactory: () => new Promise(r => resolve = r.bind(undefined, generateInjectable())),
          singleton: true,
        }
        register(provider)
        initResolverContext(TestInjectable)

        // tests the singleton request locking in DandiGenerator.fetchProviderInstance
        const result1 = generate()
        const result2 = generate()

        resolve()

        expect(await result1).to.exist
        expect(await result1).to.be.instanceof(TestInjectable)
        expect(await result1).to.equal(await result2)
        expect(generated.length).to.equal(1)

      })

    })

  })

})
