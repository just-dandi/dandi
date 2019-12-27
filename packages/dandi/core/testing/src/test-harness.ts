import { Constructor, Disposable, isConstructor } from '@dandi/common'
import {
  DandiApplication,
  InjectionToken,
  Repository,
  InjectionResult,
  Injector,
  InstanceGeneratorFactory,
  Provider,
  Resolver,
  Invoker,
  ResolvedProvider,
  InstanceInvokableFn,
  ResolverContext,
  ResolverContextConstructor,
  RootInjector,
  Registerable, MissingProviderError,
} from '@dandi/core'
import { DandiRootInjector } from '@dandi/core/src/dandi-root-injector'
import { RootInjectorContext } from '@dandi/core/src/root-injector-context'
import { isFactoryProvider, StubResolverContext } from '@dandi/core/testing'

import { SinonStub, SinonStubbedInstance, stub, createStubInstance } from 'sinon'
import { expect } from 'chai'

export type TestProvider<T> = Provider<T> & { underTest?: boolean }

export interface TestInjector extends Resolver, Invoker {

  readonly application: DandiApplication
  readonly injector: Injector

  inject<T>(token: InjectionToken<T>, optional?: boolean, ...providers: Registerable[]): Promise<T>
  injectMulti<T>(token: InjectionToken<T>, optional?: boolean, ...providers: Registerable[]): Promise<T[]>
  injectStub<T>(token: InjectionToken<T>, optional?: boolean, ...providers: Registerable[]): Promise<SinonStubbedInstance<T>>
  injectMultiStub<T>(token: InjectionToken<T>, optional?: boolean, ...providers: Registerable[]): Promise<SinonStubbedInstance<T>[]>

  register(...providers: Registerable[]): void
}

export class TestHarness implements TestInjector, Disposable {

  private _application: DandiApplication
  public get application(): DandiApplication {
    return this._application
  }


  private _injector: RootInjector
  public get injector(): Injector {
    return this._injector
  }

  private appContext: RootInjectorContext

  /**
   * Allows the use of {AmbientInjectableScanner} within a test scope without including injectables leaked from other
   * tests or modules.
   */
  public static scopeGlobalRepository(): Repository {
    let repo: Repository
    let globalRepoStub: SinonStub

    // eslint-disable-next-line @typescript-eslint/class-name-casing
    class __TestSanityChecker {}

    beforeEach(function() {
      repo = Repository.for(Math.random())
      Object.assign(repo, {
        _allowSingletons: false,
      })

      // sanity checking!
      expect(repo.get(__TestSanityChecker)).not.to.exist
      // eslint-disable-next-line no-invalid-this
      repo.register(this, __TestSanityChecker)
      expect(repo.get(__TestSanityChecker)).to.exist

      globalRepoStub = stub(Repository, 'global').get(() => repo)
    })
    afterEach(() => {
      globalRepoStub.restore()
      if (!Disposable.isDisposed(repo)) {
        repo.dispose('test complete')
      }
      repo = undefined
    })

    return Repository.global
  }

  constructor(providers: any[], suite: boolean = true, private readonly stubMissing: boolean = false) {
    if (stubMissing) {
      providers.push({
        provide: ResolverContextConstructor,
        useValue: StubResolverContext,
      })
    }
    const injectorFactory = this.testInjectorFactory.bind(this)
    if (suite) {
      beforeEach(async () => {
        const singletonedProviders = this.singletonizeProviders(providers)
        this._application = new DandiApplication({ injector: injectorFactory, providers: singletonedProviders })
        await this._application.start()
      })
      afterEach(async () => {
        await this.dispose()
      })
    } else {
      const singletonedProviders = this.singletonizeProviders(providers)
      this._application = new DandiApplication({ injector: injectorFactory, providers: singletonedProviders })
    }
  }

  private singletonizeProviders(providers: any[]): Provider<any>[] {
    return providers.map(provider => {
      // allow forcing singletons for providers that don't allow singletons
      if (!isFactoryProvider(provider) || provider.singleton || (provider as TestProvider<any>).underTest) {
        return provider
      }
      let instance
      return Object.assign({}, provider, {
        useFactory(...args: any[]) {
          if (!instance) {
            instance = provider.useFactory(...args)
          }
          return instance
        },
      })
    })
  }

  public inject<T>(token: InjectionToken<T>, optional?: boolean, ...providers: Registerable[]): Promise<T>
  public inject<T>(token: InjectionToken<T>, parentResolverContext: ResolverContext<any>, optional?: boolean, ...providers: Registerable[]): Promise<T>
  async inject<T>(token: InjectionToken<T>, ...args: any[]): Promise<T> {
    try {
      const result: InjectionResult<T> = await this._injector.inject.call(this._injector, token, ...args)
      if (!result) {
        return undefined
      }
      return result.singleValue
    } catch(err) {
      if (err instanceof MissingProviderError && this.stubMissing && isConstructor(token)) {
        return createStubInstance(token)
      }
      throw err
    }
  }

  public async injectMulti<T>(token: InjectionToken<T>, optional?: boolean, ...providers: Registerable[]): Promise<T[]>
  public async injectMulti<T>(token: InjectionToken<T>, optional?: boolean, ...providers: Registerable[]): Promise<T[]>
  async injectMulti<T>(token: InjectionToken<T>, ...args: any[]): Promise<T[]> {
    try {
      const result: InjectionResult<T> = await this._injector.inject.call(this._injector, token, ...args)
      if (!result) {
        return undefined
      }
      return result.arrayValue
    } catch(err) {
      if (err instanceof MissingProviderError && this.stubMissing && isConstructor(token)) {
        return [createStubInstance(token)]
      }
      throw err
    }
  }

  public async injectStub<T>(
    token: InjectionToken<T>,
    optional?: boolean,
    ...providers: Registerable[]
  ): Promise<SinonStubbedInstance<T>> {
    return (await this.inject(token, optional, ...providers)) as SinonStubbedInstance<T>
  }

  public async injectMultiStub<T>(
    token: InjectionToken<T>,
    optional?: boolean,
    ...providers: Registerable[]
  ): Promise<SinonStubbedInstance<T>[]> {
    return (await this.inject(token, optional, ...providers)) as unknown as SinonStubbedInstance<T>[]
  }

  public register(...providers: (Constructor<any> | Provider<any>)[]): void {
    const source = { constructor: this.constructor }
    this._injector.register(source, ...providers)
  }

  public async dispose(): Promise<void> {
    await this._application.dispose('test complete')
    this._application = undefined
  }

  private testInjectorFactory(generator: InstanceGeneratorFactory): Injector {
    this._injector = new DandiRootInjector(generator)
    this.canResolve = this._injector.canResolve.bind(this._injector)
    this.invoke = this._injector.invoke.bind(this._injector)
    this.resolve = this._injector.resolve.bind(this._injector)
    return this._injector
  }

  canResolve(token: InjectionToken<any>, ...providers: Registerable[]): boolean
  canResolve(token: InjectionToken<any>, parentInjectorContext: ResolverContext<any>, ...providers: Registerable[]): boolean
  canResolve(): boolean {
    // bound in testInjectorFactory
    return false
  }

  invoke<TInstance, TResult>(
    instance: TInstance,
    methodName: InstanceInvokableFn<TInstance, TResult>,
    ...providers: Registerable[]
  ): Promise<TResult>

  invoke<TInstance, TResult>(
    instance: TInstance,
    methodName: InstanceInvokableFn<TInstance, TResult>,
    parentInjectorContext: ResolverContext<any>,
    ...providers: Registerable[]
  ): Promise<TResult>

  invoke<TInstance, TResult>(): Promise<TResult> {
    // bound in testInjectorFactory
    return undefined
  }

  resolve<T>(token: InjectionToken<T>, ...providers: Registerable[]): ResolvedProvider<T>
  resolve<T>(token: InjectionToken<T>, optional: boolean, ...providers: Registerable[]): ResolvedProvider<T>
  resolve<T>(token: InjectionToken<T>, parentInjectorContext: ResolverContext<any>, ...providers: Registerable[]): ResolvedProvider<T>
  resolve<T>(token: InjectionToken<T>, parentInjectorContext: ResolverContext<any>, optional: boolean, ...providers: Registerable[]): ResolvedProvider<T>
  resolve<T>(): ResolvedProvider<T> {
    // bound in testInjectorFactory
    return undefined
  }
}

export function testHarness(...providers: any[]): TestInjector {
  return new TestHarness(providers)
}

/**
 * Creates an instance of {TestResolver} that automatically creates stub instances of classes it does not already
 * have registered providers for
 * @param providers
 */
export function stubHarness(...providers: any[]): TestInjector {
  return new TestHarness(providers, true, true)
}

export async function testHarnessSingle(...providers: any[]): Promise<TestInjector> {
  const harness = new TestHarness(providers, false)
  await harness.application.start()
  return harness
}

export async function stubHarnessSingle(...providers: any[]): Promise<TestInjector> {
  const harness = new TestHarness(providers, false, true)
  await harness.application.start()
  return harness
}

export function underTest<T>(provider: Constructor<T> | Provider<T>): TestProvider<T> {
  if (isConstructor(provider)) {
    return {
      provide: provider,
      useClass: provider,
      underTest: true,
    }
  }
  return Object.assign({
    underTest: true,
  }, provider)
}
