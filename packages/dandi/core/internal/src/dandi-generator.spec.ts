import {
  Inject,
  Injectable,
  InjectionToken,
  Optional,
  Registerable,
  ResolverContext,
  SymbolToken,
} from '@dandi/core'
import {
  DandiGenerator,
  DandiRootInjector,
  DandiRootInjectorContext,
} from '@dandi/core/internal'
import { getInjectionScope } from '@dandi/core/internal/util'

import { expect } from 'chai'
import { spy } from 'sinon'

describe('DandiGenerator', () => {

  class TestRootInjector extends DandiRootInjector {

    public readonly context: DandiRootInjectorContext

    constructor() {
      super(() => generator)
    }
  }

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

  let rootInjector: DandiRootInjector
  let generator: DandiGenerator
  let resolverContext: ResolverContext<any>

  function initResolverContext<T>(target: InjectionToken<T>): ResolverContext<T> {
    resolverContext = rootInjector.context.find(target)
    spy(resolverContext, 'setInstanceRequest')
    return resolverContext
  }
  const generate = (): any => generator.generateInstance(rootInjector, resolverContext)
  const register = (...providers: Registerable[]): any => rootInjector.register('Test', ...providers)

  beforeEach(() => {
    generator = new DandiGenerator()
    rootInjector = new TestRootInjector()
    spy(rootInjector, 'createChild')
  })
  afterEach(() => {
    rootInjector.dispose('test complete')
    rootInjector = undefined
    generator = undefined
    resolverContext = undefined
  })

  describe('generateInstance', () => {

    it('returns undefined if the injection scope has an undefined match', async () => {

      resolverContext = {} as unknown as ResolverContext
      const result = await generate()

      expect(result).to.be.undefined

    })

    it('instantiates an injectable class and tracks the instance with the resolverContext', async () => {

      const provider = {
        provide: TestInjectable,
        useClass: TestInjectable,
      }
      register(provider)
      initResolverContext(TestInjectable)

      const result = await generate()

      expect(result).to.exist
      expect(result).to.be.instanceOf(TestInjectable)
      expect(resolverContext.setInstanceRequest).to.have.been.calledOnceWith(provider)
    })

    it('can instantiate an injectable class with dependencies', async () => {

      register(TestWithDependency, TestInjectable)
      initResolverContext(TestWithDependency)

      const result = await generate()

      expect(result).to.exist
      expect(result).to.be.instanceOf(TestWithDependency)
      expect(result.dep).to.exist
      expect(result.dep).to.be.instanceof(TestInjectable)
    })

    it('can instantiate an injectable class with missing optional dependencies', async () => {

      register({
        provide: TestWithMissingOptionalDependency,
        useClass: TestWithMissingOptionalDependency,
      })
      initResolverContext(TestWithMissingOptionalDependency)

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
      expect(rootInjector.createChild).to.have.been
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

    it('creates instances from class providers', async () => {

      const provider = {
        provide: TestInjectable,
        useClass: TestInjectable,
      }
      register(provider)
      initResolverContext(TestInjectable)

      const result = await generate()

      expect(result).to.exist
      expect(result).to.be.instanceof(TestInjectable)

    })

    it('does not create duplicate instances', async () => {

      const provider = {
        provide: TestInjectable,
        useClass: TestInjectable,
      }
      register(provider)
      initResolverContext(TestInjectable)

      const result1 = await generate()
      const result2 = await generate()

      expect(result1).to.exist
      expect(result1).to.be.instanceof(TestInjectable)
      expect(result1).to.equal(result2)

    })

    it('does not create duplicate instances when a second request is made before the first is generated', async () => {

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
      }
      register(provider)
      initResolverContext(TestInjectable)

      // tests the instance request locking in DandiGenerator.fetchProviderInstance
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
