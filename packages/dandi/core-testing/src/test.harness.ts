import { Constructor, Disposable } from '@dandi/common'
import { Container, InjectionToken, Provider, Repository, ResolveResult, Resolver, ResolverContext } from '@dandi/core'
import { SinonStub, SinonStubbedInstance, createStubInstance, stub } from 'sinon'
import { expect } from 'chai'

export function stubProvider<TService extends TToken, TToken = TService>(
  service: Constructor<TService>,
  token?: InjectionToken<TToken>,
): Provider<TToken> {
  return {
    provide: token || service,
    useFactory: () => createStubInstance(service) as any,
    singleton: true,
  }
}

export interface TestResolver extends Resolver {
  readonly container: Container;

  resolveStub<T>(
    token: InjectionToken<T>,
    optional?: boolean,
    ...repositories: Repository[]
  ): Promise<ResolveResult<SinonStubbedInstance<T>>>;

  inject<T>(token: InjectionToken<T>, optional?: boolean, ...repositories: Repository[]): Promise<T>;

  injectStub<T>(
    token: InjectionToken<T>,
    optional?: boolean,
    ...repositories: Repository[]
  ): Promise<SinonStubbedInstance<T>>;
}

export class TestHarness implements TestResolver {
  private _container: Container;
  public get container(): Container {
    return this._container
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
      repo.register(__TestSanityChecker)
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

  constructor(providers: any[], suite: boolean = true) {
    if (suite) {
      beforeEach(async () => {
        this._container = new Container({ providers })
        await this._container.start()
      })
      afterEach(() => {
        this._container = undefined
      })
    } else {
      this._container = new Container({ providers })
    }
  }

  public invoke(instance: any, member: Function, ...repositories: Repository[]): Promise<any> {
    return this._container.invoke(instance, member, ...repositories)
  }

  public invokeInContext(
    context: ResolverContext<any>,
    instance: any,
    member: Function,
    ...repositories: Repository[]
  ): Promise<any> {
    return this._container.invokeInContext(context, instance, member, ...repositories)
  }

  public resolve<T>(
    token: InjectionToken<T>,
    optional?: boolean,
    ...repositories: Repository[]
  ): Promise<ResolveResult<T>> {
    return this._container.resolve(token, optional, ...repositories)
  }

  public resolveInContext<T>(
    context: ResolverContext<any>,
    token: InjectionToken<T>,
    optional?: boolean,
    ...repositories: Repository[]
  ): Promise<ResolveResult<T>> {
    return this._container.resolveInContext(context, token, optional, ...repositories)
  }

  public resolveStub<T>(
    token: InjectionToken<T>,
    optional?: boolean,
    ...repositories: Repository[]
  ): Promise<ResolveResult<SinonStubbedInstance<T>>> {
    return this._container.resolve(token, optional, ...repositories) as Promise<ResolveResult<SinonStubbedInstance<T>>>
  }

  public async inject<T>(token: InjectionToken<T>, optional?: boolean, ...repositories: Repository[]): Promise<T> {
    return await Disposable.use(await this.resolve<T>(token, optional, ...repositories), (result) => {
      return result.value as T
    })
  }

  public async injectStub<T>(
    token: InjectionToken<T>,
    optional?: boolean,
    ...repositories: Repository[]
  ): Promise<SinonStubbedInstance<T>> {
    return (await this.inject(token, optional, ...repositories)) as any
  }
}

export function testHarness(...providers: any[]): TestResolver {
  return new TestHarness(providers)
}

export async function testHarnessSingle(...providers: any[]): Promise<TestResolver> {
  const harness = new TestHarness(providers, false)
  await harness.container.start()
  return harness
}
