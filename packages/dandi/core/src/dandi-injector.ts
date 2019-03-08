import { Disposable, Constructor, isConstructor } from '@dandi/common'

import { AppInjectorContext } from './app-injector-context'
import { InvalidTokenError, MissingTokenError } from './dandi-application-error'
import { Inject } from './inject-decorator'
import { getInjectableMetadata } from './injectable-metadata'
import { InjectionToken, isInjectionToken } from './injection-token'
import { InjectionResult } from './injection-result'
import { InjectorContext } from './injector-context'
import { Injector, InstanceInvokableFn, InvokableFn, ResolvedProvider } from './injector'
import { InjectionContext, MethodInjectionContext, RootInjectionContext, DependencyInjectionContext } from './injection-context'
import { InstanceGenerator, InstanceGeneratorFactory } from './instance-generator'
import { Logger } from './logger'
import { MissingProviderError } from './missing-provider-error'
import { Optional } from './optional-decorator'
import { Provider } from './provider'
import { isProvider } from './provider-util'
import { RepositoryEntry } from './repository'
import { ResolverContext } from './resolver-context'
import { ResolverContextConstructor } from './resolver-context-constructor'

interface Args<T> {
  token: InjectionToken<T>
  optional: boolean
  parentInjectorContext: InjectorContext
  providers: Array<Provider<any> | Constructor<any>>
  noToken?: boolean
}
type KnownArgs<T> = { [P in keyof Args<T>]?: Args<T>[P] }

const PARSE_ARGS_A1 = 0
const PARSE_ARGS_A2 = 1
const PARSE_ARGS_PROVIDERS_START = 2

export class DandiInjector implements Injector, Disposable {

  private resolverContextConstructor: ResolverContextConstructor<any>
  private logger: Logger
  private generator: InstanceGenerator
  private readonly generatorReady: Promise<void>
  private readonly rootInjectorContext: InjectorContext

  constructor(appInjectorContext: AppInjectorContext, generatorFactory: InstanceGeneratorFactory) {
    this.rootInjectorContext = appInjectorContext.createChild(RootInjectionContext,
      {
        provide: Injector,
        useValue: this,
      },
    )
    this.resolverContextConstructor = ResolverContext
    this.generatorReady = this.initGeneratorFactory(generatorFactory)
  }

  public async init(
    @Inject(ResolverContextConstructor) @Optional() resolverContextConstructor: ResolverContextConstructor<any>,
    @Inject(Logger) logger: Logger,
  ): Promise<void> {
    if (resolverContextConstructor) {
      this.resolverContextConstructor = resolverContextConstructor
    }
    this.logger = logger
    this.logger.debug('injector initialized')
  }

  public canResolve(token: InjectionToken<any>, ...providers: Array<Provider<any> | Constructor<any>>): boolean
  public canResolve(token: InjectionToken<any>, parentInjectorContext: InjectorContext, ...providers: Array<Provider<any> | Constructor<any>>): boolean
  canResolve(token: InjectionToken<any>, ...args: any[]): boolean {
    const injectionContext: MethodInjectionContext = { instance: this, methodName: 'canResolve' }
    return !!this.resolveInternal(injectionContext, this.parseArgs({ token, optional: true }, ...args)).match
  }

  public resolve<T>(token: InjectionToken<T>, ...providers: Array<Provider<any> | Constructor<any>>): ResolvedProvider<T>
  public resolve<T>(token: InjectionToken<T>, optional: boolean, ...providers: Array<Provider<any> | Constructor<any>>): ResolvedProvider<T>
  public resolve<T>(token: InjectionToken<T>, parentInjectorContext: InjectorContext, ...providers: Array<Provider<any> | Constructor<any>>): ResolvedProvider<T>
  public resolve<T>(token: InjectionToken<T>, parentInjectorContext: InjectorContext, optional: boolean, ...providers: Array<Provider<any> | Constructor<any>>): ResolvedProvider<T>
  resolve<T>(token: InjectionToken<T>, ...args: any[]): ResolvedProvider<T> {
    const injectionContext: MethodInjectionContext = { instance: this, methodName: 'resolve' }
    return this.resolveInternal(injectionContext, this.parseArgs({ token }, ...args)).match
  }

  public inject<T>(token: InjectionToken<T>, ...providers: Array<Provider<any> | Constructor<any>>): Promise<InjectionResult<T>>
  public inject<T>(token: InjectionToken<T>, optional: boolean, ...providers: Array<Provider<any> | Constructor<any>>): Promise<InjectionResult<T>>
  public inject<T>(token: InjectionToken<T>, parentInjectorContext: InjectorContext, ...providers: Array<Provider<any> | Constructor<any>>): Promise<InjectionResult<T>>
  public inject<T>(token: InjectionToken<T>, parentInjectorContext: InjectorContext, optional: boolean, ...providers: Array<Provider<any> | Constructor<any>>): Promise<InjectionResult<T>>
  async inject<T>(token: InjectionToken<T>, ...args: any[]): Promise<InjectionResult<T>> {

    const injectArgs: Args<T> = this.parseArgs({ token }, ...args)
    const injectionContext: MethodInjectionContext = { instance: this, methodName: 'inject' }
    const injectorContext: ResolverContext<T> = this.resolveInternal(injectionContext, injectArgs)

    if (!injectorContext.match) {
      if (this.shouldDisposeResolverContext(injectorContext)) {
       injectorContext.dispose('Disposed after resolving to an undefined provider')
      }
      return undefined
    }

    try {
      this.generator || await this.generatorReady
      const result = await this.generator.generateInstance(injectorContext)
      if (result === undefined || result === null) {
        if (this.shouldDisposeResolverContext(injectorContext)) {
          injectorContext.dispose('Disposed after generating a null or undefined instance value')
        }
        return undefined
      }
      return injectorContext.resolveValue(result)
    } catch (err) {
      injectorContext.dispose(`Container error during inject: ${err.message}`)
      throw err
    }
  }

  public invoke<TInstance, TResult>(
    instance: TInstance,
    methodName: InstanceInvokableFn<TInstance, TResult>,
    ...providers: Array<Provider<any> | Constructor<any>>
  ): Promise<TResult>

  public invoke<TInstance, TResult>(
    instance: TInstance,
    methodName: InstanceInvokableFn<TInstance, TResult>,
    parentInjectorContext: InjectorContext,
    ...providers: Array<Provider<any> | Constructor<any>>
  ): Promise<TResult>

  async invoke<TInstance extends object, TResult>(
    instance: TInstance,
    methodName: InstanceInvokableFn<TInstance, TResult>,
    ...args: any[]
  ): Promise<TResult> {
    const invokeArgs = this.parseArgs({ noToken: true }, ...args)
    const invokeInjectionContext: MethodInjectionContext = { instance: this, methodName: 'invoke' }

    const method: InvokableFn<TResult> = instance[methodName] as unknown as InvokableFn<TResult>
    const meta = getInjectableMetadata(method)
    this.generator || await this.generatorReady
    return Disposable.useAsync(this.getResolverContext(undefined, invokeArgs.parentInjectorContext, invokeInjectionContext, invokeArgs.providers), async (injectorContext) => {
      const methodInjectionContext = new DependencyInjectionContext(instance, methodName as string)

      const invokeTargetArgs = (meta.params && meta.params.length)
        ? await Promise.all(meta.params.map(param =>
          this.injectParam(
            param.token,
            param.optional,
            injectorContext,
            [...param.providers || [], ...invokeArgs.providers],
            methodInjectionContext),
        ))
        : []
      return method.apply(instance, invokeTargetArgs)
    })
  }

  public injectParam<T>(
    token: InjectionToken<T>,
    optional: boolean,
    parentInjectorContext: InjectorContext,
    providers: Array<Provider<any> | Constructor<any>>,
    injectionContext: InjectionContext,
  ): Promise<T | T[]> {
    const paramInjectorContext = (parentInjectorContext || this.rootInjectorContext).createResolverContext(
      this.resolverContextConstructor,
      token,
      injectionContext,
      ...providers,
    )
    this.validateResolution(token, optional, paramInjectorContext)
    return this.generator.generateInstance(paramInjectorContext)
  }

  public dispose(reason: string): void {
    if (!Disposable.isDisposed(this.rootInjectorContext)) {
      this.rootInjectorContext.dispose(reason)
    }
  }

  private async initGeneratorFactory(generatorFactory: InstanceGeneratorFactory): Promise<void> {
    this.generator = await (typeof generatorFactory === 'function' ? generatorFactory(this) : generatorFactory)
  }

  private parseArgs<T>(knownArgs: KnownArgs<T>, ...args: any[]): Args<T> {
    if (!knownArgs.token && !knownArgs.noToken) {
      throw new MissingTokenError()
    }
    if (knownArgs.token && !isInjectionToken(knownArgs.token)) {
      throw new InvalidTokenError(knownArgs.token)
    }

    const a1 = args[PARSE_ARGS_A1]
    const a2 = args[PARSE_ARGS_A2]
    knownArgs.providers = args.slice(PARSE_ARGS_PROVIDERS_START)

    if (a1 instanceof InjectorContext) {
      knownArgs.parentInjectorContext = a1
    } else if (typeof a1 === 'boolean') {
      knownArgs.optional = a1
    } else if (isConstructor(a1) || isProvider(a1)) {
      knownArgs.providers.unshift(a1)
    }

    if (typeof a2 === 'boolean') {
      knownArgs.optional = a2
    } else if (isConstructor(a2) || isProvider(a2)) {
      knownArgs.providers.unshift(a2)
    }

    return knownArgs as Args<T>
  }

  private resolveInternal<T>(injectionContext: InjectionContext, args: Args<T>): ResolverContext<T> {
    const resolverContext = this.getResolverContext(args.token, args.parentInjectorContext, injectionContext, args.providers)
    try {
      this.validateResolution(args.token, args.optional, resolverContext)
    } catch (err) {
      resolverContext.dispose(`Container error during resolve(): ${err.message}`)
      throw err
    }
    return resolverContext
  }

  private getResolverContext<T>(
    token: InjectionToken<T>,
    parentInjectorContext: InjectorContext,
    injectionContext: InjectionContext,
    providers: Array<Provider<any> | Constructor<any>>,
  ): ResolverContext<T> {
    return parentInjectorContext ?
      parentInjectorContext.createResolverContext(this.resolverContextConstructor, token, injectionContext, ...providers) :
      this.rootInjectorContext.createResolverContext(this.resolverContextConstructor, token, injectionContext, ...providers)
  }

  private validateResolution<T>(
    token: InjectionToken<T>,
    optional: boolean,
    resolverContext: ResolverContext<T>,
  ): RepositoryEntry<T> {
    const entry = resolverContext.match

    if (!entry && !optional) {
      throw new MissingProviderError(token, resolverContext)
    }

    return entry
  }

  private shouldDisposeResolverContext(resolverContext: ResolverContext<any>): boolean {
    return resolverContext.parent instanceof AppInjectorContext || resolverContext.parent === this.rootInjectorContext
  }

}
