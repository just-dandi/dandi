import { Disposable } from '@dandi/common'

import { DandiApplicationConfig } from './dandi-application-config'
import { DandiApplicationInit } from './dandi-application-init'
import { Injector } from './injector'
import { NativeNow } from './native-now'
import { NoopLogger } from './noop-logger'
import { QueueingLogger } from './queueing-logger'

export type Options<T> = { [P in keyof T]?: T[P] }

/**
 * A container for Dandi applications
 */
export class DandiApplication<TConfig extends DandiApplicationConfig = DandiApplicationConfig> implements Disposable {

  protected readonly config: TConfig

  private readonly initHost: DandiApplicationInit<TConfig>

  /**
   *
   * @param options A [[DandiApplicationConfig]] object
   */
  constructor(options: Options<TConfig> = {}, defaults?: Options<TConfig>) {
    this.config = Object.assign({} as TConfig, defaults, options)

    if (!this.config.providers) {
      this.config.providers = []
    }
    this.config.providers.unshift(NativeNow, NoopLogger)

    this.initHost = new DandiApplicationInit(new QueueingLogger(this.constructor, NativeNow.useValue), this.config)
  }

  /**
   * Runs the application. Returns a `Promise` that is fulfilled with the value returned by the [[EntryPoint]]
   * implementation, if specified. If no [[EntryPoint]] is specified, the promise is a `Promise<void>`.
   * @param ts An optional timestamp (e.g. value of `new Date().valueOf()`) to use when computing lifecycle timing for logging and analytics
   */
  public run(ts?: number): Promise<any> {
    return this.initHost.run(ts)
  }

  /**
   * The same as [[DandiApplication.run]], but resolves with a reference to the application's [[Injector]] instance
   * once the application is started.
   * @param ts An optional timestamp (e.g. value of `new Date().valueOf()`) to use when computing lifecycle timing for logging and analytics
   */
  public start(ts?: number): Promise<Injector> {
    return this.initHost.start(ts)
  }

  /**
   * Calls `dispose(reason)` on all objects created by the application.
   * @param reason
   */
  public async dispose(reason: string): Promise<void> {
    await this.initHost.dispose(reason)
  }
}
