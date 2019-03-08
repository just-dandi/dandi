import { Disposable } from '@dandi/common'
import { DisposableUtil } from '@dandi/common/testing'
import {
  DandiInjector,
  Inject,
  Injectable,
  InjectionResult,
  InjectorContext,
  InstanceGenerator,
  InvalidTokenError,
  Invoker,
  Logger,
  MissingProviderError,
  MissingTokenError,
  Optional,
  ResolverContext,
  SymbolToken,
} from '@dandi/core'
import { AppInjectorContext, LoggerFixture } from '@dandi/core/testing'

import { expect } from 'chai'
import { stub, spy } from 'sinon'

describe('DandiInjector', function () {

  DisposableUtil.disableRemap()

  @Injectable()
  class TestInjectable {}

  @Injectable()
  class TestWithDependency {
    constructor(@Inject(TestInjectable) public dep: TestInjectable) {}
  }
  @Injectable()
  class DoesNotExist {}

  beforeEach(function() {
    this.context = function TestContext() {}
    this.appInjectorContext = new AppInjectorContext()
    this.register = this.appInjectorContext.register.bind(this.appInjectorContext, { constructor: this.context })
    this.register(TestInjectable)
    this.generator = {
      generateInstance: stub().resolves(undefined),
    }
    this.createInjector = () => new DandiInjector(this.appInjectorContext, () => this.generator)
  })
  afterEach(function() {
    this.appInjectorContext.dispose('test complete')
  })

  describe('init', function() {

    it('logs a debug message', async function() {
      const logger: Logger = new LoggerFixture()
      const injector = this.createInjector()
      await injector.init(undefined, logger)

      expect(logger.debug).to.have.been.called
    })

  })

  describe('Resolver', function() {

    beforeEach(function() {
      this.register(TestInjectable)
      this.resolver = this.createInjector()
    })

    describe('canResolve', function() {

      it('throws an error when called without an injection token', function() {
        expect(() => this.resolver.canResolve(undefined)).to.throw(MissingTokenError)
      })

      it('throws an error when called with an invalid injection token', function() {
        expect(() => this.resolver.canResolve({})).to.throw(InvalidTokenError)
      })

      it('returns true when there is a provider for the requested token', function() {
        expect(this.resolver.canResolve(TestInjectable)).to.be.true
      })

      it('returns false when there is no provider for the requested token', function() {
        expect(this.resolver.canResolve(TestWithDependency)).to.be.false
      })

      it('returns true when a provider is specified in the auxiliary providers', function() {
        expect(this.resolver.canResolve(TestWithDependency)).to.be.false // sanity check

        expect(this.resolver.canResolve(TestWithDependency, TestWithDependency)).to.be.true
      })

      it('returns true when a provider can be found in a parent injector context', function() {
        const injectorContext = new InjectorContext(undefined, function TestContext(){}, [TestWithDependency])

        expect(this.resolver.canResolve(TestWithDependency)).to.be.false // sanity check

        expect(this.resolver.canResolve(TestWithDependency, injectorContext)).to.be.true
      })

      it('returns false when there is not provider for the specified token, including in a parent injector context', function() {
        const injectorContext = new InjectorContext(undefined, function TestContext(){})
        expect(this.resolver.canResolve(TestWithDependency, injectorContext)).to.be.false
      })

    })

    describe('resolve', function() {

      it('throws an error when called without an injection token', function() {
        expect(() => this.resolver.resolve(undefined)).to.throw(MissingTokenError)
      })

      it('throws an error when called with an invalid injection token', function() {
        expect(() => this.resolver.resolve({})).to.throw(InvalidTokenError)
      })

      it('returns the provider for a resolved injection token', function() {
        expect(this.resolver.resolve(TestInjectable)).to.deep.equal({
          provide: TestInjectable,
          useClass: TestInjectable,
        })
      })

      it('throws a MissingProviderError when there is no provider for the requested token', function() {
        expect(() => this.resolver.resolve(TestWithDependency)).to.throw(MissingProviderError)
      })

      it('returns undefined when there is no provider for the requested token, and the token is optional', function() {
        expect(this.resolver.resolve(TestWithDependency, true)).to.be.undefined
      })

      it('returns the provider when it is specified in the auxiliary providers', function() {

        expect(this.resolver.resolve(TestWithDependency, true)).to.be.undefined // sanity check

        expect(this.resolver.resolve(TestWithDependency, TestWithDependency)).to.deep.equal({
          provide: TestWithDependency,
          useClass: TestWithDependency,
        })
      })

      it('returns the provider when it can be found in a parent injector context', function() {

        const injectorContext = new InjectorContext(undefined, function TestContext(){}, [TestWithDependency])

        expect(this.resolver.resolve(TestWithDependency, true)).to.be.undefined // sanity check

        expect(this.resolver.resolve(TestWithDependency, injectorContext)).to.deep.equal({
          provide: TestWithDependency,
          useClass: TestWithDependency,
        })

      })

      it('returns undefined when the provider is not in a parent injector context, and the token is optional', function() {
        const injectorContext = new InjectorContext(undefined, function TestContext(){})
        expect(this.resolver.resolve(TestWithDependency, injectorContext, true)).to.be.undefined
      })

    })

  })

  describe('TokenInjector', function() {

    beforeEach(function() {
      this.injector = this.createInjector()
    })

    describe('inject', () => {

      it('returns undefined without invoking the generator if the token resolves to an undefined provider', async function() {

        const result = await this.injector.inject(DoesNotExist, true)

        expect(result).to.be.undefined
        expect(this.generator.generateInstance).not.to.have.been.called

      })

      it('does not automatically dispose the injector context if there was a parent injector context when returning due to an undefined provider', async function() {

        spy(this.injector, 'resolveInternal')
        const parentInjectorContext = new InjectorContext(this.appInjectorContext, function TestContext(){})

        await this.injector.inject(DoesNotExist, parentInjectorContext, true)

        const injectorContext = this.injector.resolveInternal.firstCall.returnValue
        expect(Disposable.isDisposed(injectorContext)).to.be.false

      })

      it('waits for the generator to be ready before attempting to call generateInstance', async function() {
        const generator = {
          generateInstance: stub(),
        }
        let resolve
        const generatorFactory: Promise<InstanceGenerator> = new Promise<InstanceGenerator>(r => {
          resolve = r
        })
        const injector = new DandiInjector(this.appInjectorContext, generatorFactory)

        const resultPromise = injector.inject(TestInjectable)
        expect(generator.generateInstance).not.to.have.been.called

        resolve(generator)

        await resultPromise
        expect(generator.generateInstance).to.have.been.called

      })

      it('returns an InjectionResult with the value returned by generator.generateInstance', async function() {

        const instance = new TestInjectable()
        this.generator.generateInstance.resolves(instance)

        const result = await this.injector.inject(TestInjectable)

        expect(result).to.be.instanceof(InjectionResult)
        expect(result.value).to.equal(instance)

      })

      it('does not automatically dispose the injection context used to create the instance', async function() {

        const instance = new TestInjectable()
        this.generator.generateInstance.resolves(instance)

        spy(this.injector, 'resolveInternal')

        await this.injector.inject(TestInjectable)
        const injectorContext = this.injector.resolveInternal.firstCall.returnValue

        expect(Disposable.isDisposed(injectorContext)).to.be.false

      })

      it('immediately disposes the injectorContext if the generator returns undefined and there was no parent injection context', async function() {

        spy(this.injector, 'resolveInternal')

        await this.injector.inject(TestInjectable)
        const injectorContext = this.injector.resolveInternal.firstCall.returnValue

        expect(Disposable.isDisposed(injectorContext)).to.be.true

      })

      it('does not automatically dispose the injectorContext if the generator returns undefined and there was a parent injection context', async function() {

        spy(this.injector, 'resolveInternal')

        const parentInjectorContext = new InjectorContext(this.appInjectorContext, function TestContext(){})
        await this.injector.inject(TestInjectable, parentInjectorContext)
        const injectorContext = this.injector.resolveInternal.firstCall.returnValue

        expect(Disposable.isDisposed(injectorContext)).to.be.false

      })

      it('automatically disposes the injectorContext if an error is encountered and rethrows the error', async function() {

        const err = new Error('oh no!')
        this.generator.generateInstance.rejects(err)

        spy(this.injector, 'resolveInternal')

        await expect(this.injector.inject(TestInjectable)).to.be.rejectedWith(err)
        const injectorContext = this.injector.resolveInternal.firstCall.returnValue

        expect(Disposable.isDisposed(injectorContext)).to.be.true

      })

    })

  })

  describe('Invoker', function() {

    describe('invoke', () => {

      beforeEach(function() {
        this.invoker = this.createInjector()
      })

      it('calls the invoked method with injected parameters', async function() {
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
        this.register(provider1)
        this.register(provider2)
        this.generator.generateInstance.callsFake((injectorContext: ResolverContext<any>) => {
          if (injectorContext.target === provider1.provide) {
            return Promise.resolve(provider1.useValue)
          }
          if (injectorContext.target === provider2.provide) {
            return Promise.resolve(provider2.useValue)
          }
          return Promise.resolve()
        })

        await (this.invoker as Invoker).invoke(instance, 'method')

        expect(method).to.have.been.called
        expect(method).to.have.been.calledWithExactly('foo', 'bar')
      })

      it('calls the invoked method with injected parameters, using undefined for optional parameters that cannot be resolved', async function() {
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
        this.register(provider1)
        this.generator.generateInstance.callsFake((injectorContext: ResolverContext<any>) => {
          if (injectorContext.target === provider1.provide) {
            return Promise.resolve(provider1.useValue)
          }
          return Promise.resolve()
        })

        const instance = new TestClass()
        await (this.invoker as Invoker).invoke(instance, 'method')
        expect(method).to.have.been.called
        expect(method).to.have.been.calledWithExactly('foo', undefined)
      })

      it('calls the invoked method even if it has no parameters', async function() {
        const method = stub()
        class TestClass {
          public method() {
            // trying to spy on this mucks up Reflection, so just do it manually
            return method()
          }
        }

        const instance = new TestClass()
        await (this.invoker as Invoker).invoke(instance, 'method')
        expect(method).to.have.been.called
        expect(method).to.have.been.calledWithExactly()

      })
    })
  })

})
