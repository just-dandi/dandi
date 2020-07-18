import { Injectable, Inject, Optional } from '@dandi/core/decorators'
import { EntryPoint, Injector, Logger, Now, NowFn } from '@dandi/core/types'

@Injectable()
export class Bootstrapper {
  constructor(
    @Inject(Injector) private injector: Injector,
    @Inject(Now) private now: NowFn,
    @Inject(Logger) private logger: Logger,
    @Inject(EntryPoint) @Optional() private entryPoint: EntryPoint<any>,
  ) {}

  public async run(startTs: number): Promise<any> {
    this.logger.debug(`Application starting after ${this.now() - startTs}ms`)
    let result: any
    if (this.entryPoint) {
      result = await this.entryPoint.run()
    } else {
      this.logger.debug('No EntryPoint implementation found.')
    }
    this.logger.debug(`Application started after ${this.now() - startTs}ms`)
    return result
  }
}
