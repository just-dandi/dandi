import { Constructor, Disposable, isConstructor } from '@dandi/common'
import { Container, InjectionToken, Repository, ResolveResult, Resolver, ResolverContext, Provider } from '@dandi/core'
import { isFactoryProvider } from '@dandi/core/testing'

import { SinonStub, SinonStubbedInstance, stub } from 'sinon'
import { expect } from 'chai'

import { StubResolverContextFactory } from './stub-resolver-context-factory'

export type TestProvider<T> = Provider<T> & { underTest?: boolean }

export interface TestResolver extends Resolver {
  readonly container: Container
  readonly repository: Repository

  resolveStub<T>(
    token: InjectionToken<T>,
    optional?: boolean,
    ...repositories: Repository[]
  ): Promise<ResolveResult<SinonStubbedInstance<T>>>

  inject<T>(token: InjectionToken<T>, optional?: boolean, ...repositories: Repository[]): Promise<T>

  injectMulti<T>(token: InjectionToken<T>, optional?: boolean, ...repositories: Repository[]): Promise<T[]>

  injectStub<T>(
    token: InjectionToken<T>,
    optional?: boolean,
    ...repositories: Repository[]
  ): Promise<SinonStubbedInstance<T>>

  register(...providers: Constructor<any>[]): void

  registerProviders(...providers: Provider<any>[]): void
}

export class TestHarness implements TestResolver, Disposable {
  private _container: Container;
  public get container(): Container {
    return this._container
  }

  private _repository: Repository
  public get repository(): Repository {
    return this._repository
  }

  /**
   * Allows the use of {AmbientInjectableScanner} within a test context without including injectables leaked from other
   * tests or modules.
   */
  public static scopeGlobalRepository(): Repository {
    let repo: Repository
    let globalRepoStub: SinonStub

    // eslint-disable-next-line typescript/class-name-casing
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

  constructor(providers: any[], suite: boolean = true, stubMissing: boolean = false) {
    if (stubMissing) {
      providers.push(StubResolverContextFactory)
    }
    if (suite) {
      beforeEach(async () => {
        const singletonedProviders = this.singletonizeProviders(providers)
        this._container = new Container({ providers: singletonedProviders })
        this._repository = Repository.for(this._container)
        await this._container.start()
      })
      afterEach(() => {
        this.dispose()
      })
    } else {
      const singletonedProviders = this.singletonizeProviders(providers)
      this._container = new Container({ providers: singletonedProviders })
      this._repository = Repository.for(this._container)
    }
  }

  private singletonizeProviders(providers: any[]) {
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

  public invoke(instance: any, member: Function, ...repositories: Repository[]): Promise<any> {
    return this._container.invoke(instance, member, this.repository, ...repositories)
  }

  public invokeInContext(
    context: ResolverContext<any>,
    instance: any,
    member: Function,
    ...repositories: Repository[]
  ): Promise<any> {
    return this._container.invokeInContext(context, instance, member, this.repository, ...repositories)
  }

  public canResolve(
    token: InjectionToken<any>,
    ...repositories: Repository[]
  ): boolean {
    return this._container.canResolve(token, ...repositories)
  }

  public resolve<T>(
    token: InjectionToken<T>,
    optional?: boolean,
    ...repositories: Repository[]
  ): Promise<ResolveResult<T>> {
    expect(this).to.be.instanceof(TestHarness)
    expect(this.repository).to.exist
    return this._container.resolve(token, optional, this.repository, ...repositories)
  }

  public resolveInContext<T>(
    context: ResolverContext<any>,
    token: InjectionToken<T>,
    optional?: boolean,
    ...repositories: Repository[]
  ): Promise<ResolveResult<T>> {
    return this._container.resolveInContext(context, token, optional, this.repository, ...repositories)
  }

  public resolveStub<T>(
    token: InjectionToken<T>,
    optional?: boolean,
    ...repositories: Repository[]
  ): Promise<ResolveResult<SinonStubbedInstance<T>>> {
    return this._container.resolve(token, optional, this.repository, ...repositories) as Promise<ResolveResult<SinonStubbedInstance<T>>>
  }

  public async inject<T>(token: InjectionToken<T>, optional?: boolean, ...repositories: Repository[]): Promise<T> {
    return await Disposable.use(await this.resolve<T>(token, optional, ...repositories), (result) => {
      return result && result.singleValue || undefined
    })
  }

  public async injectMulti<T>(token: InjectionToken<T>, optional?: boolean, ...repositories: Repository[]): Promise<T[]> {
    return await Disposable.use(await this.resolve<T>(token, optional, ...repositories), (result) => {
      return result && result.arrayValue || undefined
    })
  }

  public async injectStub<T>(
    token: InjectionToken<T>,
    optional?: boolean,
    ...repositories: Repository[]
  ): Promise<SinonStubbedInstance<T>> {
    return (await this.inject(token, optional, ...repositories)) as any
  }

  public registerProviders(...providers: Provider<any>[]): void {
    this.repository.registerProviders(...providers)
  }

  public register(...providers: Constructor<any>[]): void {
    const source = { constructor: this.constructor }
    providers.forEach(p => this.repository.register(source, p))
  }

  public dispose() {
    this.repository.dispose('test complete')
    this._container = undefined
    this._repository = undefined
  }
}

export function testHarness(...providers: any[]): TestResolver {
  return new TestHarness(providers)
}

export function stubHarness(...providers: any[]): TestResolver {
  return new TestHarness(providers, true, true)
}

export async function testHarnessSingle(...providers: any[]): Promise<TestResolver> {
  const harness = new TestHarness(providers, false)
  await harness.container.start()
  return harness
}

export async function stubHarnessSingle(...providers: any[]): Promise<TestResolver> {
  const harness = new TestHarness(providers, false, true)
  await harness.container.start()
  return harness
}

export function underTest<T>(provider: Provider<T>): TestProvider<any> {
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
