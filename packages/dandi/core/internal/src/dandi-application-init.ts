import { Disposable } from '@dandi/common'
import { Inject, Optional } from '@dandi/core/decorators'
import { DandiApplicationError } from '@dandi/core/errors'
import { Bootstrapper } from '@dandi/core/internal'
import { getInstance } from '@dandi/core/internal/util'
import {
  DandiApplicationConfig,
  Injector,
  InstanceGenerator,
  InstanceGeneratorFactory,
  Logger,
  LogStream,
  Now,
  NowFn,
  OnConfig,
  RegistrationSource,
  RootInjector,
  Scanner,
} from '@dandi/core/types'

import { localToken } from '../../src/local-token'

import { DandiRootInjector } from './dandi-root-injector'
import { DandiGenerator } from './dandi-generator'
import { AppInjectionScope } from './root-injection-scope'
import { QueueingLogger } from './queueing-logger'
import { OnConfigInternal } from './on-config-internal'

function defaultInjectorFactory(generator: InstanceGeneratorFactory): RootInjector {
  return new DandiRootInjector(generator)
}

function defaultGeneratorFactory(): InstanceGenerator {
  return new DandiGenerator()
}

export interface DandiApplicationInternalConfig extends DandiApplicationConfig {
  injector?: (generator: InstanceGeneratorFactory) => RootInjector
}

const RootInjector = localToken.opinionated<RootInjector>('RootInjector', { multi: false })


/**
 * @internal
 */
export class DandiApplicationInit<TConfig extends DandiApplicationInternalConfig> {

  public startTs: number
  public get injector(): Injector {
    return this.appInjector
  }

  private appInjector: Injector
  private initialized: boolean = false
  private started: boolean = false
  private readonly initHost: DandiApplicationInit<TConfig>

  constructor(public logger: Logger, private config: TConfig) {
    this.initHost = this
  }

  public async start(ts?: number): Promise<Injector> {
    await this.run(ts)
    return this.appInjector
  }

  public async run(ts?: number): Promise<any> {
    this.logger.debug('Start')
    this.startTs = ts || this.config.startTs || new Date().valueOf()
    if (this.started) {
      throw new DandiApplicationError('start has already been called')
    }
    await this.preInit()
    await this.appInjector.invoke(this.initHost, 'init')
    this.started = true

    await this.appInjector.invoke(this.initHost, 'runConfig')

    return this.bootstrap()
  }

  public async preInit(): Promise<void> {
    if (this.initialized) {
      return
    }
    this.logger.debug('PreInit')

    // register the rootInjector
    const source = {
      constructor: this.constructor,
      tag: '.preInit',
    }

    const rootInjector = await getInstance(this.config.injector || defaultInjectorFactory, defaultGeneratorFactory)
    if (Disposable.isDisposable(rootInjector)) {
      Disposable.makeDisposable(this, (reason: string) => rootInjector.dispose(reason))
    }

    // register explicitly set providers
    // this must happen before scanning so that scanners can be specified in the providers config
    this.registerRootProviders(rootInjector, source, this.config.providers)

    // this must happen before instantiating the appInjector so that if an alternate InjectorContextConstructor is
    // configured, it can be picked up
    await rootInjector.invoke(rootInjector, 'init')

    // re-register explicitly set providers in the application injector so that they override any implementations
    // discovered by scanning
    this.appInjector = rootInjector.createChild(AppInjectionScope, this.config.providers.concat({
      provide: RootInjector,
      useValue: rootInjector,
    }))

    this.initialized = true

    await this.appInjector.invoke(this.initHost, 'runConfigInternal')
  }

  public async init(
    @Inject(Injector) injector: Injector,
    @Inject(Logger) logger: Logger,
    @Inject(Now) now: NowFn,
    @Inject(LogStream) @Optional() logStream?: LogStream,
  ): Promise<void> {
    if (logStream) {
      (this.logger as QueueingLogger).flush(logStream)
    }
    this.logger = logger

    logger.debug(`Application initializing after ${now() - this.startTs}ms`)

    await injector.invoke(this.initHost, 'scan')

    logger.debug(`Application initialized after ${now() - this.startTs}ms`)
  }

  public async scan(
    @Inject(RootInjector) rootInjector: RootInjector,
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
        rootInjector.register(scanner, ...(await scanner.scan()))
      }),
    )
  }

  public async runConfig(
    @Inject(Logger) logger: Logger,
    @Inject(Now) now: NowFn,
    @Inject(OnConfig) @Optional() configs?: OnConfig[],
  ): Promise<void> {
    if (logger) {
      logger.debug(`Application configuring after ${now() - this.startTs}ms`)
    }
    if (configs) {
      await Promise.all(configs.map(config => config()))
    }
    if (logger) {
      logger.debug(`Application configured after ${now() - this.startTs}ms`)
    }
  }

  public async runConfigInternal(@Inject(OnConfigInternal) @Optional() configs: OnConfig[]): Promise<void> {
    return this.runConfig(undefined, undefined, configs)
  }

  public async bootstrap(
  ): Promise<any> {
    const bootstrapper = (await this.appInjector.inject(Bootstrapper)).singleValue
    return await bootstrapper.run(this.startTs)
  }

  public registerRootProviders(rootInjector: RootInjector, parentSource: RegistrationSource, module: any): void {
    if (Array.isArray(module)) {
      const source = module.constructor === Array ?
        // use parentSource if the "module" is just a plain array to avoid an extra useless entry in the source chain
        parentSource :
        {
          constructor: module.constructor,
          parent: parentSource,
        }
      module.forEach((provider) => this.registerRootProviders(rootInjector, source, provider))
      return
    }
    const source = {
      constructor: this.constructor,
      parent: parentSource,
      tag: '.config.providers',
    }
    rootInjector.register(source, module)
  }
}
