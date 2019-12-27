import { RootInjectionScope } from './injection-scope'
import { InjectorContext } from './injector-context'
import { Registerable } from './module'
import { RepositoryRegistrationSource } from './repository-registration'

/**
 * @internal
 */
export class RootInjectorContext extends InjectorContext {

  constructor() {
    super(undefined, RootInjectionScope)
  }

  public register(source: RepositoryRegistrationSource, ...providers: Registerable[]): this {
    return this.registerInternal(providers, source)
  }

}
