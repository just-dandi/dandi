import { Constructor } from '@dandi/common'

import { AppInjectionContext } from './injection-context'
import { InjectorContext } from './injector-context'
import { Provider } from './provider'
import { RepositoryRegistrationSource } from './repository-registration'

/**
 * @internal
 * @ignore
 */
export class AppInjectorContext extends InjectorContext {

  constructor() {
    super(undefined, AppInjectionContext)
  }

  public register(source: RepositoryRegistrationSource, ...providers: (Provider<any> | Constructor<any>)[]): this {
    providers.forEach(p => this.repository.register(source, p))
    return this
  }

}
