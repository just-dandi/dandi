import { Disposable } from '@dandi/common'
import {
  DandiGenerator,
  DandiInjector,
  Inject,
  Injectable,
  InjectionResult,
  InstanceGenerator,
  InvalidTokenError,
  Invoker,
  MissingProviderError,
  MissingTokenError,
  Optional, Registerable,
  ResolverContext,
  SymbolToken,
  Injector,
} from '@dandi/core'

import { expect } from 'chai'
import { stub, spy, SinonStubbedInstance, SinonSpy } from 'sinon'

import { DandiRootInjector } from './dandi-root-injector'

describe('DandiInjector', () => {

  @Injectable()
  class TestInjectable {}

  @Injectable()
  class TestWithDependency {
    constructor(@Inject(TestInjectable) public dep: TestInjectable) {}
  }
  @Injectable()
  class DoesNotExist {}

  let rootInjector: DandiRootInjector
  let injector: DandiInjector
  let generator: SinonStubbedInstance<DandiGenerator>

  function createInjector(...providers: Registerable[]): DandiInjector {
    return injector = rootInjector.createChild('DandiInjector Test Instance', providers)
  }

  function register(...providers: Registerable[]): void {
    rootInjector.register(DandiRootInjector, ...providers)
  }

  beforeEach(() => {
    generator = {
      generateInstance: stub().resolves(undefined),
    } as unknown as SinonStubbedInstance<DandiGenerator>
    rootInjector = new DandiRootInjector(() => generator as unknown as DandiGenerator)
  })
  afterEach(async () => {
    await rootInjector.dispose('test complete')
  })

  describe('Resolver', () => {

    beforeEach(() => {
      createInjector(TestInjectable)
    })

    describe('canResolve', () => {

      it('throws an error when called without an injection token', () => {
        expect(() => injector.canResolve(undefined)).to.throw(MissingTokenError)
      })

      it('throws an error when called with an invalid injection token', () => {
        expect(() => injector.canResolve({} as any)).to.throw(InvalidTokenError)
      })

      it('returns true when there is a provider for the requested token', () => {
        expect(injector.canResolve(TestInjectable)).to.be.true
      })

      it('returns false when there is no provider for the requested token', () => {
        expect(injector.canResolve(TestWithDependency)).to.be.false
      })

      it('returns true when a provider is specified in the auxiliary providers', () => {
        expect(injector.canResolve(TestWithDependency)).to.be.false // sanity check

        expect(injector.canResolve(TestWithDependency, TestWithDependency)).to.be.true
      })

      it('returns true when a provider can be found in a parent injector', () => {
        expect(injector.canResolve(TestWithDependency)).to.be.false // sanity check
        register(TestWithDependency)

        expect(injector.canResolve(TestWithDependency)).to.be.true
      })

      it('returns false when there is not provider for the specified token, including in a parent rootInjector scope', () => {
        expect(injector.canResolve(TestWithDependency)).to.be.false
      })

    })

    describe('resolve', () => {

      it('throws an error when called without an injection token', () => {
        expect(() => injector.resolve(undefined)).to.throw(MissingTokenError)
      })

      it('throws an error when called with an invalid injection token', () => {
        expect(() => injector.resolve({} as any)).to.throw(InvalidTokenError)
      })

      it('returns the provider for a resolved injection token', () => {
        expect(injector.resolve(TestInjectable)).to.deep.equal({
          provide: TestInjectable,
          useClass: TestInjectable,
        })
      })

      it('throws a MissingProviderError when there is no provider for the requested token', () => {
        expect(() => injector.resolve(TestWithDependency)).to.throw(MissingProviderError)
      })

      it('returns undefined when there is no provider for the requested token, and the token is optional', () => {
        expect(injector.resolve(TestWithDependency, true)).to.be.undefined
      })

      it('returns the provider when it is specified in the auxiliary providers', () => {

        expect(injector.resolve(TestWithDependency, true)).to.be.undefined // sanity check

        expect(injector.resolve(TestWithDependency, TestWithDependency)).to.deep.equal({
          provide: TestWithDependency,
          useClass: TestWithDependency,
        })
      })

    })

  })

  describe('TokenInjector', () => {

    let resolveInternal: SinonSpy

    beforeEach(() => {
      createInjector()
      const ogCreateChild = injector.createChild
      stub(injector, 'createChild').callsFake((...args: any[]) => {
        const child = ogCreateChild.apply(injector, args)
        resolveInternal = spy(child, 'resolveInternal')
        return child
      })
    })
    afterEach(() => {
      resolveInternal = undefined
    })

    describe('inject', () => {

      it('returns undefined without invoking the generator if the token resolves to an undefined provider', async () => {

        const result = await injector.inject(DoesNotExist, true)

        expect(result).to.be.undefined
        expect(generator.generateInstance).not.to.have.been.called

      })

      it('waits for the generator to be ready before attempting to call generateInstance', async () => {
        let resolve
        const generatorFactory: Promise<InstanceGenerator> = new Promise<InstanceGenerator>(r => {
          resolve = r
        })
        const injector = new DandiRootInjector(generatorFactory)

        const resultPromise = injector.inject(TestInjectable, TestInjectable)
        expect(generator.generateInstance).not.to.have.been.called

        resolve(generator)

        await resultPromise
        expect(generator.generateInstance).to.have.been.called

      })

      it('returns an InjectionResult with the value returned by generator.generateInstance', async () => {

        const instance = new TestInjectable()
        generator.generateInstance.resolves(instance)

        const result = await injector.inject(TestInjectable, TestInjectable)

        expect(result).to.be.instanceof(InjectionResult)
        expect(result.value).to.equal(instance)

      })

      it('does not automatically dispose the resolver scope used to create the instance', async () => {

        const instance = new TestInjectable()
        generator.generateInstance.resolves(instance)

        const result = await injector.inject(TestInjectable, TestInjectable)
        expect(result).to.exist
        expect(resolveInternal).to.have.been.called
        const resolverContext = resolveInternal.firstCall.returnValue

        expect(Disposable.isDisposed(resolverContext)).to.be.false

      })

      it('immediately disposes the resolver scope if the generator returns undefined', async () => {

        const result = await injector.inject(TestInjectable, TestInjectable)
        expect(resolveInternal).to.have.been.called
        const resolverContext = resolveInternal.firstCall.returnValue

        expect(result).to.be.undefined // sanity check
        expect(Disposable.isDisposed(resolverContext)).to.be.true

      })

    })

  })

  describe('Invoker', () => {

    describe('invoke', () => {

      beforeEach(() => {
        createInjector()
      })

      it('calls the invoked method with injected parameters', async () => {
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
          public method(@Inject(token1) a: any, @Inject(token2) b: any): any {
            // trying to spy on this mucks up Reflection, so just do it manually
            return method(a, b)
          }
        }
        const instance = new TestClass()
        register(provider1)
        register(provider2)
        generator.generateInstance.callsFake((injector: Injector, resolverContext: ResolverContext<any>) => {
          if (resolverContext.target === provider1.provide) {
            return Promise.resolve(provider1.useValue)
          }
          if (resolverContext.target === provider2.provide) {
            return Promise.resolve(provider2.useValue)
          }
          return Promise.resolve()
        })

        await (injector as Invoker).invoke(instance, 'method')

        expect(method).to.have.been.called
        expect(method).to.have.been.calledWithExactly('foo', 'bar')
      })

      it('calls the invoked method with injected parameters, using undefined for optional parameters that cannot be resolved', async () => {
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
          ): any {
            // trying to spy on this mucks up Reflection, so just do it manually
            return method(a, b)
          }
        }
        register(provider1)
        generator.generateInstance.callsFake((injector: Injector, injectorContext: ResolverContext<any>) => {
          if (injectorContext.target === provider1.provide) {
            return Promise.resolve(provider1.useValue)
          }
          return Promise.resolve()
        })

        const instance = new TestClass()
        await (injector as Invoker).invoke(instance, 'method')
        expect(method).to.have.been.called
        expect(method).to.have.been.calledWithExactly('foo', undefined)
      })

      it('calls the invoked method even if it has no parameters', async () => {
        const method = stub()
        class TestClass {
          public method(): any {
            // trying to spy on this mucks up Reflection, so just do it manually
            return method()
          }
        }

        const instance = new TestClass()
        await (injector as Invoker).invoke(instance, 'method')
        expect(method).to.have.been.called
        expect(method).to.have.been.calledWithExactly()

      })
    })
  })

})
