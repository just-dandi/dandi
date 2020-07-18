import { EntryPoint, Inject, Injectable, Logger } from '@dandi/core'

const RUN_FAKE_WORK_TIMEOUT = 5
const SIM_FAKE_WORK_TIMEOUT = 50

@Injectable(EntryPoint)
export class SimpleConsoleApp implements EntryPoint {
  constructor(@Inject(Logger) private logger: Logger) {}

  public async run(): Promise<void> {
    this.logger.debug('Just starting up here')

    await this.fakeWork(RUN_FAKE_WORK_TIMEOUT)

    this.logger.info('Ready to go!')

    this.simulateDoingStuff()
  }

  private async simulateDoingStuff(): Promise<void> {
    await this.fakeWork(SIM_FAKE_WORK_TIMEOUT)
    this.logger.warn('Hey maybe look into this okay')
    this.logger.error('Okay stop everything, something is wrong')
    this.logger.error(new Error('FIXME'))
  }

  private fakeWork(timeout: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, timeout))
  }
}
