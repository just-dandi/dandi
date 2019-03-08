import { getInjectableMetadata } from './injectable-metadata'
import { getInjectionContext } from './injection-context-util'
import { ProviderTypeError } from './provider-type-error'
import { TokenInjector } from './injector'
import { InstanceGenerator } from './instance-generator'
import { GeneratingProvider, Provider } from './provider'
import {
  isAsyncFactoryProvider,
  isClassProvider,
  isFactoryProvider,
  isGeneratingProvider,
  isValueProvider,
} from './provider-util'
import { ResolverContext } from './resolver-context'
import { ResolverContextConstructor } from './resolver-context-constructor'
import { DependencyInjectionContext } from './injection-context'

export class DandiGenerator implements InstanceGenerator {

  private singletonRequests = new Map<Provider<any>, Promise<any>>()

  constructor(private injector: TokenInjector) {}

  public async generateInstance<T>(resolverContext: ResolverContext<T>): Promise<T | T[]> {
    const entry = resolverContext.match

    if (entry === undefined) {
      return undefined
    }

    if (entry instanceof Set) {
      const resolverContextConstructor = resolverContext.constructor as ResolverContextConstructor<T>
      return await Promise.all(
        [...entry].map((provider) =>
          this.fetchProviderInstance(provider, resolverContext.createResolverContext(resolverContextConstructor, resolverContext.target, getInjectionContext(provider))),
          // this.fetchProviderInstance(provider, injectorContext.createChild(injectorContext.target, injectorContext.context)),
        ),
      )
    }

    return this.fetchProviderInstance(entry, resolverContext)
  }

  protected async generate<T>(provider: GeneratingProvider<T>, resolverContext: ResolverContext<T>): Promise<T> {

    if (isFactoryProvider(provider)) {
      const args = (provider.deps && provider.deps.length)
        ? await Promise.all(
          provider.deps.map((paramToken) =>
            this.injector.injectParam(paramToken, false, resolverContext, provider.providers || [], provider.useFactory),
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
      const injectionContext = new DependencyInjectionContext(provider.useClass)
      const args = (meta.params && meta.params.length)
        ? await Promise.all(
          meta.params.map((param) => this.injector.injectParam(param.token, param.optional, resolverContext, provider.providers || [], injectionContext)),
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

  private async fetchProviderInstance<T>(provider: Provider<T>, resolverContext: ResolverContext<T>): Promise<T> {
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
      request = this.generate(provider, resolverContext)
      this.singletonRequests.set(provider, request)
      const result = resolverContext.addSingleton(provider, await request)
      this.singletonRequests.delete(provider)
      return result
    }

    return await this.generate(provider, resolverContext)
  }
}
