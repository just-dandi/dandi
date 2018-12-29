import { Inject } from './inject.decorator'
import { Injectable } from './injectable.decorator'
import { Logger } from './logger'
import { Repository } from './repository'
import { Scanner } from './scanner'

@Injectable(Scanner)
export class AmbientInjectableScanner implements Scanner {

  constructor(@Inject(Logger) private logger: Logger) {}

  public async scan(): Promise<Repository> {
    this.logger.debug('Adding global repository')
    return Repository.global
  }
}
