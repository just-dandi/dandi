import { Optional, Inject } from '@dandi/core/decorators'
import {
  InjectorContextConstructor,
  InstanceGeneratorFactory,
  Registerable,
  RegistrationSource,
  RootInjector,
} from '@dandi/core/types'

import { DandiInjector } from './dandi-injector'
import { DandiInjectorContext } from './dandi-injector-context'
import { DandiRootInjectorContext } from './dandi-root-injector-context'
import { RootInjectionScope } from './root-injection-scope'

/**
 * @internal
 */
export class DandiRootInjector extends DandiInjector implements RootInjector {

  public readonly context: DandiRootInjectorContext

  protected injectorContextConstructor: InjectorContextConstructor

  constructor(generatorFactory: InstanceGeneratorFactory) {
    super(
      undefined,
      new RootInjectionScope(),
      generatorFactory,
      DandiInjectorContext,
      [],
    )
    this.context = new DandiRootInjectorContext()
  }

  public register(source: RegistrationSource, ...providers: Registerable[]): this {
    this.context.register(source, ...providers)
    return this
  }

  public init(@Inject(InjectorContextConstructor) @Optional() injectorContextConstructor: InjectorContextConstructor): void {
    if (injectorContextConstructor) {
      this.injectorContextConstructor = injectorContextConstructor
    }
  }
}
