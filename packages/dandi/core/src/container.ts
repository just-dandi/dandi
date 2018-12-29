import { Disposable } from '@dandi/common'

import { Bootstrapper } from './bootstrapper'
import { ContainerError, ContainerNotInitializedError, MissingTokenError } from './container.error'
import { Inject } from './inject.decorator'
import { ParamMetadata, getInjectableMetadata } from './injectable.metadata'
import { getInjectionContext } from './injection.context.util'
import { InjectionToken } from './injection.token'
import { Logger } from './logger'
import { MissingProviderError } from './missing.provider.error'
import { NativeNow } from './native.now'
import { NoopLogger } from './noop-logger'
import { Now, NowFn } from './now'
import { Optional } from './optional.decorator'
import { OnConfig } from './on-config'
import { OnConfigInternal } from './on-config-internal'
import { ProviderTypeError } from './provider.type.error'
import { Repository } from './repository'
import { ResolveResult } from './resolve.result'
import { Resolver } from './resolver'
import { ResolverContext } from './resolver.context'
import { Scanner } from './scanner'
import { GeneratingProvider, Provider } from './provider'
import {
  isAsyncFactoryProvider,
  isClassProvider,
  isFactoryProvider,
  isGeneratingProvider,
  isValueProvider,
} from './provider.util'

export interface ContainerConfig {
  providers?: any[]
}

export type Options<T> = { [P in keyof T]?: T[P] }

export class Container<TConfig extends ContainerConfig = ContainerConfig> implements Resolver {

  protected get repositories() {
    return [
      ...this.scannedRepositories,

      // IMPORTANT! this must come after scanned repositories so that explicitly specified providers
      // take precedence over scanned providers
      this.repository,
    ]
  }

  protected readonly config: TConfig;
  protected readonly repository: Repository

  private initialized: boolean = false
  private startTs: number;
  private started: boolean = false
  private singletonRequests = new Map<Provider<any>, Promise<any>>()
  private scannedRepositories: Repository[] = []

  constructor(options: Options<TConfig> = {}, defaults?: Options<TConfig>) {
    this.config = Object.assign({} as TConfig, defaults, options)
    this.repository = Repository.for(this)

    if (!this.config.providers) {
      this.config.providers = []
    }
    this.config.providers.unshift(NativeNow, NoopLogger)
  }

  public async start(ts?: number): Promise<any> {
    this.startTs = ts || new Date().valueOf()
    if (this.started) {
      throw new ContainerError('start has already been called')
    }
    await this.preInit()
    await this.invoke(this, this.init)
    this.started = true

    await this.invoke(this, this.runConfig)
    await this.invoke(this, this.bootstrap)
  }

  public async resolveInContext<T>(
    context: ResolverContext<T>,
    token: InjectionToken<T>,
    optional: boolean = false,
    ...repositories: Repository[]
  ): Promise<ResolveResult<T>> {
    if (!this.initialized) {
      throw new ContainerNotInitializedError()
    }

    if (!token) {
      throw new MissingTokenError()
    }

    const resolveContext = context
      ? context.childContext(token, null, ...this.repositories, ...repositories)
      : ResolverContext.create<T>(token, null, ...this.repositories, ...repositories)
    try {
      const result = await this.resolveInternal(token, optional, resolveContext)
      if (!result) {
        return null
      }
      return resolveContext.resolveValue(result)
    } catch (err) {
      resolveContext.dispose(`Container error during resolve(): ${err.message}`)
      throw err
    }
  }

  public resolve<T>(
    token: InjectionToken<T>,
    optional: boolean = false,
    ...repositories: Repository[]
  ): Promise<ResolveResult<T>> {
    return this.resolveInContext(null, token, optional, ...repositories)
  }

  public invoke(instance: object, member: Function, ...repositories: Repository[]): Promise<any> {
    return this.invokeInContext(null, instance, member, ...repositories)
  }

  public async invokeInContext(
    context: ResolverContext<any>,
    instance: object,
    member: Function,
    ...repositories: Repository[]
  ): Promise<any> {
    if (!this.initialized) {
      throw new ContainerNotInitializedError()
    }

    const injectionContext = { instance, method: member }
    repositories.unshift(...this.repositories)
    const meta = getInjectableMetadata(member)
    const resolveContext = context
      ? context.childContext(null, injectionContext, ...repositories)
      : ResolverContext.create(null, injectionContext, ...repositories)
    return Disposable.useAsync(resolveContext, async (context) => {
      const args = meta.params
        ? await Promise.all(meta.params.map((param) => this.resolveParam(param, param.token, param.optional, context)))
        : []
      return await member.apply(instance, args)
    })
  }

  protected async onInit(): Promise<void> {}

  protected async generate<T>(provider: GeneratingProvider<T>, context: ResolverContext<T>): Promise<T> {
    if (provider.providers) {
      context = context.childContext(provider.provide, context.context, ...provider.providers)
    }

    if (isFactoryProvider(provider)) {
      const meta = getInjectableMetadata(provider.useFactory)
      const args = provider.deps
        ? await Promise.all(
            provider.deps.map((paramToken, paramIndex) => {
              const paramMeta = meta.params && meta.params[paramIndex]
              const optional = paramMeta && paramMeta.optional === true
              return this.resolveParam(null, paramToken, optional, context)
            }),
          )
        : []
      const instance: T = isAsyncFactoryProvider(provider)
        ? await provider.useFactory(...args)
        : provider.useFactory(...args)
      if (provider.singleton) {
        return instance
      }
      return context.addInstance(instance)
    }

    if (isClassProvider(provider)) {
      const meta = getInjectableMetadata(provider.useClass)
      const args = meta.params
        ? await Promise.all(meta.params.map((param) => this.resolveParam(param, param.token, param.optional, context)))
        : []
      const instance = new provider.useClass(...args)
      if (provider.singleton) {
        return instance
      }
      return context.addInstance(instance)
    }

    throw new ProviderTypeError(provider)
  }

  private async preInit(): Promise<void> {
    if (this.initialized) {
      return
    }

    // register self as the Resolver
    this.repository.register({
      provide: Resolver,
      useValue: this,
    })

    // register explicitly set providers
    // this must happen before scanning so that scanners can be specified in the providers config
    if (this.config.providers) {
      this.registerProviders(this.config.providers)
    }

    this.initialized = true

    await this.invoke(this, this.runConfigInternal)
  }

  private async init(@Inject(Logger) logger: Logger, @Inject(Now) now: NowFn): Promise<void> {
    // can't log before now because nothing will pick it up - log listener subscriptions happen in OnStartupInternal
    logger.debug(`application initializing after ${now() - this.startTs}ms`)

    await this.invoke(this, this.scan)

    await this.onInit()

    logger.debug(`application initialized after ${now() - this.startTs}ms`)
  }

  private async scan(
    @Inject(Logger) logger: Logger,
    @Inject(Now) now: NowFn,
    @Inject(Scanner) @Optional() scanners?: Scanner[],
  ): Promise<void> {
    if (!scanners) {
      logger.debug('No scanners registered')
      return
    }
    await Promise.all(
      scanners.map(async (scanner: Scanner) => {
        logger.debug(`Scanning for injectable modules with ${scanner.constructor.name}...`)
        this.scannedRepositories.push(await scanner.scan())
      }),
    )
  }

  private async runConfig(
    @Inject(Logger) logger: Logger,
    @Inject(Now) now: NowFn,
    @Inject(OnConfig) @Optional() configs?: OnConfig[],
  ): Promise<void> {
    if (logger) {
      logger.debug(`application configuring after ${now() - this.startTs}ms`)
    }
    if (configs) {
      await Promise.all(configs.map(startup => startup()))
    }
    if (logger) {
      logger.debug(`application configured after ${now() - this.startTs}ms`)
    }
  }

  private async runConfigInternal(@Inject(OnConfigInternal) @Optional() configs: OnConfig[]): Promise<void> {
    return this.runConfig(null, null, configs)
  }

  private async bootstrap(
    @Inject(Logger) logger,
    @Inject(Now) now: NowFn,
    @Inject(Bootstrapper) @Optional() bootstrapper?: Bootstrapper,
  ): Promise<void> {
    logger.debug(`Application starting after ${now() - this.startTs}ms`)
    if (bootstrapper) {
      await bootstrapper.start()
    }
    logger.debug(`application started after ${now() - this.startTs}ms`)
  }

  private registerProviders(module: any): void {
    if (Array.isArray(module)) {
      module.forEach((provider) => this.registerProviders(provider))
      return
    }
    this.repository.register(module)
  }

  private async resolveParam<T>(
    param: ParamMetadata<T>,
    token: InjectionToken<T>,
    optional: boolean,
    context: ResolverContext<T>,
  ) {
    return await this.resolveInternal(
      token,
      optional,
      context.childContext(token, null, ...((param && param.providers) || [])),
    )
  }

  private async resolveProvider<T>(provider: Provider<T>, context: ResolverContext<T>): Promise<T> {
    if (isValueProvider(provider)) {
      return provider.useValue
    }
    if (isGeneratingProvider(provider) && provider.singleton) {
      const instance = context.getSingleton(provider)
      if (instance) {
        return instance
      }
      let request = this.singletonRequests.get(provider)
      if (request) {
        return await request
      }
      request = this.generate(provider, context)
      this.singletonRequests.set(provider, request)
      const result = context.addSingleton(provider, await request)
      this.singletonRequests.delete(provider)
      return result
    }

    return await this.generate(provider, context)
  }

  private async resolveInternal<T>(
    token: InjectionToken<T>,
    optional: boolean,
    context: ResolverContext<T>,
  ): Promise<T | T[]> {
    const entry = context.match

    if (!entry) {
      if (!optional) {
        throw new MissingProviderError(token, context)
      }
      return null
    }

    if (Array.isArray(entry)) {
      return await Promise.all(
        entry.map((provider) => {
          return this.resolveProvider(provider, context.childContext(token, getInjectionContext(provider)))
        }),
      )
    }

    return this.resolveProvider(entry, context)
  }
}
