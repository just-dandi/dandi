import { getInjectableMetadata } from './injectable-metadata'
import { getInjectionScope } from './injection-scope-util'
import { DependencyInjectionScope } from './injection-scope'
import { Injector } from './injector'
import { InstanceGenerator } from './instance-generator'
import { GeneratingProvider, Provider } from './provider'
import { ProviderTypeError } from './provider-type-error'
import {
  isAsyncFactoryProvider,
  isClassProvider,
  isFactoryProvider,
  isGeneratingProvider,
  isValueProvider,
} from './provider-util'
import { ResolverContext } from './resolver-context'

export class DandiGenerator implements InstanceGenerator {

  private singletonRequests = new Map<Provider<any>, Promise<any>>()

  public async generateInstance<T>(injector: Injector, resolverContext: ResolverContext<T>): Promise<T | T[]> {
    const entry = resolverContext.match

    if (entry === undefined) {
      return undefined
    }

    if (entry instanceof Set) {
      return await Promise.all(
        [...entry].map((provider) => {
          const entryInjector = injector.createChild(getInjectionScope(provider))
          return this.fetchProviderInstance(entryInjector, provider, entryInjector.createResolverContext(resolverContext.target))
        }),
      )
    }

    return await this.fetchProviderInstance(injector, entry, resolverContext)
  }

  protected async generate<T>(injector: Injector, provider: GeneratingProvider<T>, resolverContext: ResolverContext<T>): Promise<T> {

    if (isFactoryProvider(provider)) {
      const args = (provider.deps && provider.deps.length)
        ? await Promise.all(
          provider.deps.map((paramToken) =>
            injector.injectParam(paramToken, false, provider.providers || [], provider.useFactory),
          ),
        )
        : []
      const instance: T = isAsyncFactoryProvider(provider)
        ? await provider.useFactory(...args)
        : provider.useFactory(...args)
      if (provider.singleton) {
        return instance
      }
      return resolverContext.addInstance(instance)
    }

    if (isClassProvider(provider)) {
      const meta = getInjectableMetadata(provider.useClass)
      const args = (meta.params && meta.params.length)
        ? await Promise.all(
          meta.params.map((param) => {
            const paramScope = new DependencyInjectionScope(provider.useClass, undefined, param.name)
            return injector.injectParam(param.token, param.optional, provider.providers || [], paramScope)
          }),
        )
        : []
      const instance = new provider.useClass(...args)
      if (provider.singleton) {
        return instance
      }
      return resolverContext.addInstance(instance)
    }

    throw new ProviderTypeError(provider)
  }

  private async fetchProviderInstance<T>(injector: Injector, provider: Provider<T>, resolverContext: ResolverContext<T>): Promise<T> {
    if (isValueProvider(provider)) {
      return provider.useValue
    }
    if (isGeneratingProvider(provider) && provider.singleton) {
      const instance = resolverContext.getSingleton(provider)
      if (instance !== undefined) {
        return instance
      }
      let request = this.singletonRequests.get(provider)
      if (request) {
        return await request
      }
      // FIXME: this could result in scoping issues when singletons are provided in differing repository levels
      request = this.generate(injector, provider, resolverContext)
      this.singletonRequests.set(provider, request)
      const result = resolverContext.addSingleton(provider, await request)
      this.singletonRequests.delete(provider)
      return result
    }

    return await this.generate(injector, provider, resolverContext)
  }
}
