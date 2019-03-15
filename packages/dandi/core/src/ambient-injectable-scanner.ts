import { Constructor } from '@dandi/common'

import { Inject } from './inject-decorator'
import { Injectable } from './injectable-decorator'
import { Logger } from './logger'
import { Provider } from './provider'
import { Repository, RepositoryEntry } from './repository'
import { Scanner } from './scanner'

function reducer(result: Provider<any>[], entry: RepositoryEntry<any>): Array<Provider<any> | Constructor<any>> {
  if (entry instanceof Set) {
    result.push(...entry)
  } else {
    result.push(entry)
  }
  return result
}

/**
 * A [[Scanner]] implementation that automatically discovers any classes decorated with [[Injectable]] that have been
 * loaded by the application. This will include any classes defined in modules that are statically referenced by the
 * your application.
 *
 * ```typescript
 * import { AmbientInjectableScanner, DandiApplication } from '@dandi/core`
 *
 * const app = new DandiApplication({
 *   providers: [
 *     AmbientInjectableScanner,
 *   ],
 * })
 * ```
 */
@Injectable(Scanner)
export class AmbientInjectableScanner implements Scanner {

  constructor(@Inject(Logger) private logger: Logger) {}

  public async scan(): Promise<Array<Provider<any> | Constructor<any>>> {
    this.logger.debug('Adding entries from global repository')
    const entries: RepositoryEntry<any>[] = [...Repository.global.entries()]
    return entries.reduce(reducer, [] as Provider<any>[])
  }
}
