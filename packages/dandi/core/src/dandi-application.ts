import { Disposable } from '@dandi/common'
import { DandiApplicationInit, QueueingLogger, DandiApplicationInternalConfig } from '@dandi/core/internal'
import { DandiApplicationConfig, Injector } from '@dandi/core/types'

import { NativeNow } from './native-now'

export class DandiApplication<TConfig extends DandiApplicationConfig = DandiApplicationInternalConfig>
  implements Disposable {
  protected readonly config: TConfig

  private readonly initHost: DandiApplicationInit<TConfig>

  constructor(options: Partial<TConfig> = {}, defaults?: Partial<TConfig>) {
    this.config = Object.assign({} as TConfig, defaults, options)

    if (!this.config.providers) {
      this.config.providers = []
    }

    this.initHost = new DandiApplicationInit(new QueueingLogger(this.constructor, NativeNow.useValue), this.config)
  }

  public run(ts?: number): Promise<any> {
    return this.initHost.run(ts)
  }

  public start(ts?: number): Promise<Injector> {
    return this.initHost.start(ts)
  }

  public async dispose(reason: string): Promise<void> {
    await Disposable.dispose(this.initHost, reason)
  }
}
