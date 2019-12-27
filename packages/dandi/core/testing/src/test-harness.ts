import { Constructor, Disposable, isConstructor } from '@dandi/common'
import {
  DandiApplication,
  InjectionToken,
  InjectionResult,
  Injector,
  InjectorContextConstructor,
  InstanceGeneratorFactory,
  Provider,
  Resolver,
  Invoker,
  ResolvedProvider,
  InstanceInvokableFn,
  RootInjector,
  Registerable,
  MissingProviderError,
} from '@dandi/core'
import { DandiRootInjector } from '@dandi/core/internal'
import { StubInjectorContext } from '@dandi/core/testing'

import { SinonStubbedInstance, createSandbox } from 'sinon'
import { INJECTABLE_REGISTRATION_DATA, InjectableRegistrationData, isFactoryProvider } from '@dandi/core/internal/util'

const sandbox = createSandbox()

export const { createStubInstance, reset, restore, spy, stub } = sandbox

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

  constructor(providers: any[], suite: boolean = true, private readonly stubMissing: boolean = false) {
    if (stubMissing) {
      providers.push({
        provide: InjectorContextConstructor,
        useValue: StubInjectorContext,
      })
    }
    const injectorFactory = this.testInjectorFactory.bind(this)

    if (suite) {
      this.initSandbox()
      this.stubInjectableRegistration()
      this.initApplication(providers, injectorFactory)
    } else {
      const singletonedProviders = this.singletonizeProviders(providers)
      this._application = new DandiApplication({ injector: injectorFactory, providers: singletonedProviders })
    }
  }

  private initSandbox(): void {
    // restore the default sinon sandbox after every test
    afterEach(() => restore())
  }

  private stubInjectableRegistration(): void {
    // prevents injectables defined in tests from polluting the global registration data array
    let injectableRegistrationData: InjectableRegistrationData[]
    beforeEach(() => {
      injectableRegistrationData = []
      stub(INJECTABLE_REGISTRATION_DATA, 'push').callsFake(entry => injectableRegistrationData.push(entry))
      stub(INJECTABLE_REGISTRATION_DATA, 'forEach').callsFake(fn => injectableRegistrationData.forEach(fn))
    })
    afterEach(() => {
      injectableRegistrationData = undefined
    })
  }

  private initApplication(providers: any[], injectorFactory: () => RootInjector): void {
    beforeEach(async () => {
      const singletonedProviders = this.singletonizeProviders(providers)
      this._application = new DandiApplication({ injector: injectorFactory, providers: singletonedProviders })
      await this._application.start()
    })
    afterEach(async () => {
      await this.dispose()
    })
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

  public register(...providers: Registerable[]): void {
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
  canResolve(): boolean {
    // bound in testInjectorFactory
    return false
  }

  invoke<TInstance, TResult>(
    instance: TInstance,
    methodName: InstanceInvokableFn<TInstance, TResult>,
    ...providers: Registerable[]
  ): Promise<TResult>

  invoke<TInstance, TResult>(): Promise<TResult> {
    // bound in testInjectorFactory
    return undefined
  }

  resolve<T>(token: InjectionToken<T>, ...providers: Registerable[]): ResolvedProvider<T>
  resolve<T>(token: InjectionToken<T>, optional: boolean, ...providers: Registerable[]): ResolvedProvider<T>
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
