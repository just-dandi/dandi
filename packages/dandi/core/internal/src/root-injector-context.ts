import { RegistrationSource, Registerable } from '@dandi/core/types'

import { DandiInjectorContext } from './dandi-injector-context'
import { RootInjectionScope } from './root-injection-scope'


/**
 * @internal
 */
export class RootInjectorContext extends DandiInjectorContext {

  constructor() {
    super(undefined, RootInjectionScope)
  }

  public register(source: RegistrationSource, ...providers: Registerable[]): this {
    return this.registerInternal(providers, source)
  }

}
