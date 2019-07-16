import { Disposable } from '@dandi/common'

import { DandiApplicationConfig } from './dandi-application-config'
import { DandiApplicationInit } from './dandi-application-init'
import { Injector } from './injector'
import { NativeNow } from './native-now'
import { NoopLogger } from './noop-logger'
import { QueueingLogger } from './queueing-logger'

export class DandiApplication<TConfig extends DandiApplicationConfig = DandiApplicationConfig> implements Disposable {

  protected readonly config: TConfig

  private readonly initHost: DandiApplicationInit<TConfig>

  constructor(options: Partial<TConfig> = {}, defaults?: Partial<TConfig>) {
    this.config = Object.assign({} as TConfig, defaults, options)

    if (!this.config.providers) {
      this.config.providers = []
    }
    this.config.providers.unshift(NativeNow, NoopLogger)

    this.initHost = new DandiApplicationInit(new QueueingLogger(this.constructor, NativeNow.useValue), this.config)
  }

  public run(ts?: number): Promise<any> {
    return this.initHost.run(ts)
  }

  public start(ts?: number): Promise<Injector> {
    return this.initHost.start(ts)
  }

  public async dispose(reason: string): Promise<void> {
    await this.initHost.dispose(reason)
  }
}
