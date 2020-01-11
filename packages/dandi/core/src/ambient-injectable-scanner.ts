import { Inject, Injectable } from '@dandi/core/decorators'
import { GLOBAL_SCOPE, Repository, RepositoryEntry } from '@dandi/core/internal'
import { INJECTABLE_REGISTRATION_DATA } from '@dandi/core/internal/util'
import { Logger, Registerable, Scanner } from '@dandi/core/types'

export const INJECTABLE_REGISTRATION_SOURCE = {
  constructor: Injectable,
  tag: '.global',
}

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
    const globalRepo = Repository.for(GLOBAL_SCOPE)

    this.logger.debug('Registering injectables with global repository')
    INJECTABLE_REGISTRATION_DATA.forEach(({ target, providerOptions}) =>
      globalRepo.register(INJECTABLE_REGISTRATION_SOURCE, target, providerOptions))

    this.logger.debug('Adding providers from global repository')
    const entries: RepositoryEntry<any>[] = [...globalRepo.providers]
    return entries.reduce(reducer, [] as Registerable[])
  }
}
