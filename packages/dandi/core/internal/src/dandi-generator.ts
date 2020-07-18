import { ProviderTypeError } from '@dandi/core/errors'
import {
  getInjectableMetadata,
  getInjectionScope,
  getRestrictedScope,
  getScopeRestriction,
  isAsyncFactoryProvider,
  isClassProvider,
  isFactoryProvider,
  isValueProvider,
} from '@dandi/core/internal/util'
import {
  ClassProvider,
  DependencyInjectionScope,
  FactoryParamInjectionScope,
  FactoryProvider,
  GeneratingProvider,
  Injector,
  InstanceGenerator,
  Provider,
  ResolverContext,
  InjectionScope,
  InjectorContext,
} from '@dandi/core/types'

import { DandiResolverContext } from './dandi-resolver-context'

/**
 * @internal
 */
export class DandiGenerator implements InstanceGenerator {
  public async generateInstance<T>(parentInjector: Injector, resolverContext: ResolverContext<T>): Promise<T | T[]> {
    const entry = resolverContext.match

    // this should not happen in practice due to previous checks
    if (entry === undefined) {
      return undefined
    }

    if (entry instanceof Set) {
      return await Promise.all(
        [...entry].map((provider) => this.generateInstanceFromProvider(parentInjector, resolverContext, provider)),
      )
    }

    return this.generateInstanceFromProvider(parentInjector, resolverContext, entry)
  }

  private async generateInstanceFromProvider<T>(
    parentInjector: Injector,
    resolverContext: ResolverContext<T>,
    provider: Provider<T>,
  ): Promise<T> {
    const injector = parentInjector.createChild(getInjectionScope(provider))
    return await this.fetchProviderInstance(injector, resolverContext, provider)
  }

  protected async generate<T>(injector: Injector, provider: GeneratingProvider<T>): Promise<T> {
    if (isFactoryProvider(provider)) {
      return this.generateForFactoryProvider(injector, provider)
    }

    if (isClassProvider(provider)) {
      return this.generateForClassProvider(injector, provider)
    }

    // this should not happen due to previous checks
    throw new ProviderTypeError(provider)
  }

  private async generateForFactoryProvider<T>(injector: Injector, provider: FactoryProvider<T>): Promise<T> {
    const args = provider.deps?.length
      ? await Promise.all(
          provider.deps.map(async (paramToken) => {
            const paramScope: FactoryParamInjectionScope = {
              target: provider,
              paramToken,
            }
            const paramInjector = injector.createChild(paramScope, provider.providers)
            // TODO: add way to make a factory dependency optional
            return (await paramInjector.inject(paramToken, false))?.value
          }),
        )
      : []

    return isAsyncFactoryProvider(provider) ? await provider.useFactory(...args) : provider.useFactory(...args)
  }

  private async generateForClassProvider<T>(injector: Injector, provider: ClassProvider<T>): Promise<T> {
    const meta = getInjectableMetadata(provider.useClass)
    const args =
      meta.params && meta.params.length
        ? await Promise.all(
            meta.params.map(async (param) => {
              const paramScope = new DependencyInjectionScope(provider.useClass, undefined, param.name)
              const paramInjector = injector.createChild(paramScope, provider.providers)
              return (await paramInjector.inject(param.token, param.optional))?.value
            }),
          )
        : []
    return new provider.useClass(...args)
  }

  private async fetchProviderInstance<T>(
    injector: Injector,
    resolverContext: ResolverContext<T>,
    provider: Provider<T>,
  ): Promise<T> {
    if (isValueProvider(provider)) {
      return provider.useValue
    }
    return this.fetchGeneratedProviderInstance(injector, resolverContext as DandiResolverContext<T>, provider)
  }

  private async fetchGeneratedProviderInstance<T>(
    injector: Injector,
    resolverContext: DandiResolverContext<T>,
    provider: GeneratingProvider<T>,
  ): Promise<T> {
    const instance = resolverContext.getInstance(provider)
    if (instance !== undefined) {
      return instance
    }
    let request = resolverContext.getInstanceRequest(provider)
    if (request) {
      return await request
    }
    const restriction = getScopeRestriction(provider)
    const instanceContext = resolverContext.injectorContext.findInstanceContext(
      resolverContext.matchContext,
      restriction,
    )
    const scope = getRestrictedScope(restriction)
    const parentInjector = this.findParentInjector(injector, instanceContext, scope)
    request = this.generate(parentInjector, provider)
    return await resolverContext.setInstanceRequest(provider, request)
  }

  /**
   * Instances must only be created using the injector that registered the provider - this ensures that if they inject
   * {@link Injector} themselves, it will use the appropriate context, will not "leak" providers registered in the
   * child hierarchy they were actually instantiated from, and that the resulting injector will not be incorrectly
   * disposed due to the instance being created within a `{@link Injector.invoke} call.
   */
  private findParentInjector<T>(injector: Injector, instanceContext: InjectorContext, scope: InjectionScope): Injector {
    if (injector.context === instanceContext) {
      return injector
    }
    if (injector.parent) {
      return this.findParentInjector(injector.parent, instanceContext, scope)
    }
    return undefined
  }
}
