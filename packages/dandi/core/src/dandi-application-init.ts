import { Disposable } from '@dandi/common'

import { EntryPoint } from './entry-point'
import { DandiApplicationConfig } from './dandi-application-config'
import { DandiApplicationError } from './dandi-application-error'
import { DandiRootInjector } from './dandi-root-injector'
import { DandiGenerator } from './dandi-generator'
import { getInstance } from './factory-util'
import { Inject } from './inject-decorator'
import { Injector, RootInjector } from './injector'
import { AppInjectionScope } from './injection-scope'
import { InstanceGenerator, InstanceGeneratorFactory } from './instance-generator'
import { LogStream } from './log-stream'
import { Logger } from './logger'
import { Now, NowFn } from './now'
import { Optional } from './optional-decorator'
import { OnConfig } from './on-config'
import { OnConfigInternal } from './on-config-internal'
import { QueueingLogger } from './queueing-logger'
import { RepositoryRegistrationSource } from './repository-registration'
import { Scanner } from './scanner'

function defaultInjectorFactory(generator: InstanceGeneratorFactory): RootInjector {
  return new DandiRootInjector(generator)
}

function defaultGeneratorFactory(): InstanceGenerator {
  return new DandiGenerator()
}

/**
 * @internal
 */
export class DandiApplicationInit<TConfig extends DandiApplicationConfig> implements Disposable {

  public startTs: number
  public get injector(): Injector {
    return this.appInjector
  }

  private appInjector: Injector
  private rootInjector: RootInjector
  private initialized: boolean = false
  private started: boolean = false
  private readonly initHost: DandiApplicationInit<TConfig>

  constructor(public logger: Logger, private config: TConfig) {
    this.initHost = this
  }

  public async start(ts?: number): Promise<Injector> {
    await this.run(ts)
    return this.rootInjector
  }

  public async run(ts?: number): Promise<any> {
    this.logger.debug('Start')
    this.startTs = ts || this.config.startTs || new Date().valueOf()
    if (this.started) {
      throw new DandiApplicationError('start has already been called')
    }
    await this.preInit()
    await this.rootInjector.invoke(this.initHost, 'init')
    this.started = true

    await this.rootInjector.invoke(this.initHost, 'runConfig')
    return this.rootInjector.invoke(this.initHost, 'bootstrap')
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

    this.rootInjector = await getInstance(
      this.config.injector || defaultInjectorFactory,
      this.config.generator || defaultGeneratorFactory,
    )
    // register explicitly set providers
    // this must happen before scanning so that scanners can be specified in the providers config
    this.registerRootProviders(source, this.config.providers)

    // re-register explicitly set providers in the application injector so that they override any implementations
    // discovered by scanning
    this.appInjector = this.rootInjector.createChild(AppInjectionScope, this.config.providers)

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

    // await rootInjector.invoke(this.rootInjector, 'init')
    await injector.invoke(this.initHost, 'scan')

    logger.debug(`Application initialized after ${now() - this.startTs}ms`)
  }

  public async scan(
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
        this.rootInjector.register(scanner, ...(await scanner.scan()))
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
    @Inject(Logger) logger,
    @Inject(Now) now: NowFn,
    @Inject(EntryPoint) @Optional() entryPoint?: EntryPoint<any>,
  ): Promise<void> {
    logger.debug(`Application starting after ${now() - this.startTs}ms`)
    let result: any
    if (entryPoint) {
      result = await entryPoint.run()
    } else {
      logger.debug('No EntryPoint implementation found.')
    }
    logger.debug(`Application started after ${now() - this.startTs}ms`)
    return result
  }

  public registerRootProviders(parentSource: RepositoryRegistrationSource, module: any): void {
    if (Array.isArray(module)) {
      const source = module.constructor === Array ?
        // use parentSource if the "module" is just a plain array to avoid an extra useless entry in the source chain
        parentSource :
        {
          constructor: module.constructor,
          parent: parentSource,
        }
      module.forEach((provider) => this.registerRootProviders(source, provider))
      return
    }
    const source = {
      constructor: this.constructor,
      parent: parentSource,
      tag: '.config.providers',
    }
    this.rootInjector.register(source, module)
  }

  public async dispose(reason: string): Promise<void> {
    if (Disposable.isDisposable(this.rootInjector)) {
      await this.rootInjector.dispose(reason)
    }
  }
}
