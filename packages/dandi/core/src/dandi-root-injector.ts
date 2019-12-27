import { DandiInjector } from './dandi-injector'
import { RootInjectionScope } from './injection-scope'
import { RootInjector } from './injector'
import { InjectorContext } from './injector-context'
import { InstanceGeneratorFactory } from './instance-generator'
import { Registerable } from './module'
import { ResolverContext } from './resolver-context'
import { ResolverContextConstructor } from './resolver-context-constructor'
import { RootInjectorContext } from './root-injector-context'
import { RepositoryRegistrationSource } from './repository-registration'

function rootInjectorParent(context: InjectorContext): DandiInjector {
  return { context } as unknown as DandiInjector
}

export class DandiRootInjector extends DandiInjector implements RootInjector {

  public readonly context: RootInjectorContext = new RootInjectorContext()

  constructor(generatorFactory: InstanceGeneratorFactory) {
    super(
      RootInjectionScope,
      rootInjectorParent(new RootInjectorContext()),
      generatorFactory,
      ResolverContext,
      [
        { provide: ResolverContextConstructor, useValue: ResolverContext },
      ],
    )
  }

  public register(source: RepositoryRegistrationSource, ...providers: Registerable[]): this {
    this.context.register(source, ...providers)
    return this
  }
}
