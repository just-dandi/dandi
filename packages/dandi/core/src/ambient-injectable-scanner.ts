import { Inject } from './inject-decorator'
import { Injectable } from './injectable-decorator'
import { Logger } from './logger'
import { Repository, RepositoryEntry } from './repository'
import { Scanner } from './scanner'
import { Registerable } from './module'

function reducer(result: Registerable[], entry: RepositoryEntry<any>): Registerable[] {
  if (entry instanceof Set) {
    result.push(...entry)
  } else {
    result.push(entry)
  }
  return result
}

@Injectable(Scanner)
export class AmbientInjectableScanner implements Scanner {

  constructor(@Inject(Logger) private logger: Logger) {}

  public async scan(): Promise<Registerable[]> {
    this.logger.debug('Adding entries from global repository')
    const entries: RepositoryEntry<any>[] = [...Repository.global.entries()]
    return entries.reduce(reducer, [] as Registerable[])
  }
}
