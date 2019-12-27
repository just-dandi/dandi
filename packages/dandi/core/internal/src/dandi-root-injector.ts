import { Optional, Inject } from '@dandi/core/decorators'
import {
  InjectorContext,
  InjectorContextConstructor,
  InstanceGeneratorFactory,
  Registerable,
  RegistrationSource,
  RootInjector,
} from '@dandi/core/types'

import { DandiInjector } from './dandi-injector'
import { DandiInjectorContext } from './dandi-injector-context'
import { RootInjectionScope } from './root-injection-scope'
import { RootInjectorContext } from './root-injector-context'

function rootInjectorParent(context: InjectorContext): DandiInjector {
  return { context } as unknown as DandiInjector
}

export class DandiRootInjector extends DandiInjector implements RootInjector {

  public readonly context: RootInjectorContext = new RootInjectorContext()

  protected injectorContextConstructor: InjectorContextConstructor

  constructor(generatorFactory: InstanceGeneratorFactory) {
    super(
      RootInjectionScope,
      rootInjectorParent(new RootInjectorContext()),
      generatorFactory,
      DandiInjectorContext,
      [],
    )
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
