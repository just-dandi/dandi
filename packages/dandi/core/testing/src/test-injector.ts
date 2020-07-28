import { isConstructor } from '@dandi/common'
import {
  DandiApplication,
  InjectionScope,
  InjectionToken,
  Injector,
  Invoker,
  MissingProviderError,
  Provider,
  Registerable,
  Resolver,
} from '@dandi/core'

import { SinonStubbedInstance } from 'sinon'

import { createStubInstance } from './sandbox'

export interface TestInjector extends Resolver, Invoker {
  readonly injector: Injector

  inject<T>(token: InjectionToken<T>, optional?: boolean): Promise<T>
  injectMulti<T>(token: InjectionToken<T>, optional?: boolean): Promise<T[]>
  injectStub<T>(token: InjectionToken<T>, optional?: boolean): Promise<SinonStubbedInstance<T>>
  injectMultiStub<T>(token: InjectionToken<T>, optional?: boolean): Promise<SinonStubbedInstance<T>[]>

  createChild(scope: InjectionScope, ...providers: Registerable[]): TestInjector
}

export interface RootTestInjector extends TestInjector {
  readonly application: DandiApplication
  register(...providers: Registerable[]): this
}

export class TestInjectorBase implements TestInjector {
  public get injector(): Injector {
    return this._injector
  }

  constructor(protected _injector: Injector, protected readonly stubMissing: boolean = false) {
    if (this.injector) {
      this.bindInjector()
    }
  }

  public canResolve(): boolean {
    return undefined
  }

  public createChild(scope: InjectionScope, ...providers: Registerable[]): TestInjector {
    return new TestInjectorBase(this.injector.createChild(scope, providers), this.stubMissing)
  }

  public async inject<T>(token: InjectionToken<T>, optional?: boolean): Promise<T> {
    try {
      const result: T | T[] = await this.injector.inject.call(this.injector, token, optional)
      if (!result) {
        return undefined
      }
      return result as T
    } catch (err) {
      if (err instanceof MissingProviderError && this.stubMissing && isConstructor(token)) {
        return createStubInstance(token)
      }
      throw err
    }
  }

  public async injectMulti<T>(token: InjectionToken<T>, optional?: boolean): Promise<T[]> {
    try {
      const result: T | T[] = await this.injector.inject.call(this.injector, token, optional)
      if (!result) {
        return undefined
      }
      return result as T[]
    } catch (err) {
      if (err instanceof MissingProviderError && this.stubMissing && isConstructor(token)) {
        return [createStubInstance(token)]
      }
      throw err
    }
  }

  public async injectStub<T>(token: InjectionToken<T>, optional?: boolean): Promise<SinonStubbedInstance<T>> {
    return (await this.inject(token, optional)) as SinonStubbedInstance<T>
  }

  public async injectMultiStub<T>(
    token: InjectionToken<T>,
    optional?: boolean,
  ): Promise<SinonStubbedInstance<T>[]> {
    return ((await this.inject(token, optional)) as unknown) as SinonStubbedInstance<T>[]
  }

  public invoke<TInstance extends object, TResult>(): Promise<TResult> {
    return undefined
  }

  public resolve<T>(): Provider<T> | Set<Provider<T>> {
    return undefined
  }

  protected bindInjector(): void {
    this.canResolve = this.injector.canResolve.bind(this.injector)
    this.invoke = this.injector.invoke.bind(this.injector)
    this.resolve = this.injector.resolve.bind(this.injector)
  }
}
