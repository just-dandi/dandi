import { Disposable } from '@dandi/common';

import { Bootstrapper } from './bootstrapper';
import {
  ContainerError,
  ContainerNotInitializedError,
  MissingTokenError,
} from './container.error';
import { getInjectableMetadata, ParamMetadata } from './injectable.metadata';
import { getInjectionContext } from './injection.context.util';
import { InjectionToken } from './injection.token';
import { Logger } from './logger';
import { NoopLogger } from './noop.logger';
import { Repository } from './repository';
import { ResolveResult } from './resolve.result';
import { Resolver } from './resolver';
import { ResolverContext } from './resolver.context';
import { Scanner } from './scanner';

import {
  GeneratingProvider,
  MissingProviderError,
  Provider,
  ProviderTypeError,
} from './provider';

import {
  isAsyncFactoryProvider,
  isClassProvider,
  isFactoryProvider,
  isGeneratingProvider,
  isValueProvider,
} from './provider.util';

export interface ContainerConfig {
  providers?: any[];
}

export type Options<T> = { [P in keyof T]?: T[P] };

export class Container<TConfig extends ContainerConfig = ContainerConfig>
  implements Resolver {
  protected get repositories(): Repository[] {
    return [
      ...this.scannedRepositories,

      // IMPORTANT! this must come after scanned repositories so that explicitly specified providers
      // take precedence over scanned providers
      this.repository,
    ];
  }

  protected readonly config: TConfig;

  protected readonly repository: Repository = Repository.for(this);

  private initialized: boolean = false;
  private started: boolean = false;
  private singletonRequests = new Map<Provider<any>, Promise<any>>();
  private scannedRepositories: Repository[] = [];

  constructor(options: Options<TConfig> = {}, defaults?: Options<TConfig>) {
    this.config = Object.assign({} as TConfig, defaults, options);
  }

  public async start(): Promise<any> {
    if (this.started) {
      throw new ContainerError('start has already been called');
    }
    await this.init();
    this.started = true;

    const bootstrapper = await this.resolve<Bootstrapper>(Bootstrapper, true);
    if (bootstrapper) {
      bootstrapper.singleValue.start();
    }
  }

  public async resolve<T>(
    token: InjectionToken<T>,
    optional: boolean = false,
    ...repositories: Repository[]
  ): Promise<ResolveResult<T>> {
    if (!this.initialized) {
      throw new ContainerNotInitializedError();
    }

    if (!token) {
      throw new MissingTokenError();
    }

    const context = ResolverContext.create<T>(
      token,
      null,
      ...this.repositories,
      ...repositories,
    );
    try {
      const result = await this.resolveInternal(token, optional, context);
      if (!result) {
        return null;
      }
      return context.resolveValue(result);
    } catch (err) {
      context.dispose(`Container error during resolve(): ${err.message}`);
      throw err;
    }
  }

  public invoke(
    instance: any,
    member: Function,
    ...repositories: Repository[]
  ): Promise<any> {
    return this.invokeInContext(null, instance, member, ...repositories);
  }

  public async invokeInContext(
    context: ResolverContext<any>,
    instance: any,
    member: Function,
    ...repositories: Repository[]
  ): Promise<any> {
    if (!this.initialized) {
      throw new ContainerNotInitializedError();
    }

    repositories.unshift(...this.repositories);
    const meta = getInjectableMetadata(member);
    const invokeContext = context
      ? context.childContext(null, member, ...repositories)
      : ResolverContext.create(null, member, ...repositories);
    return Disposable.useAsync(invokeContext, async (context) => {
      const args = meta.params
        ? await Promise.all(
            meta.params.map((param) =>
              this.resolveParam(param, param.token, param.optional, context),
            ),
          )
        : [];
      return await member.apply(instance, args);
    });
  }

  protected async onInit(): Promise<void> {}

  protected async generate<T>(
    provider: GeneratingProvider<T>,
    context: ResolverContext<T>,
  ): Promise<T> {
    if (provider.providers) {
      context = context.childContext(
        provider.provide,
        context.context,
        ...provider.providers,
      );
    }

    if (isFactoryProvider(provider)) {
      const meta = getInjectableMetadata(provider.useFactory);
      const args = provider.deps
        ? await Promise.all(
            provider.deps.map((paramToken, paramIndex) => {
              const paramMeta = meta.params && meta.params[paramIndex];
              const optional = paramMeta && paramMeta.optional === true;
              return this.resolveParam(null, paramToken, optional, context);
            }),
          )
        : [];
      const instance: T = isAsyncFactoryProvider(provider)
        ? await provider.useFactory(...args)
        : provider.useFactory(...args);
      if (provider.singleton) {
        return instance;
      }
      return context.addInstance(instance);
    }

    if (isClassProvider(provider)) {
      const meta = getInjectableMetadata(provider.useClass);
      const args = meta.params
        ? await Promise.all(
            meta.params.map((param) =>
              this.resolveParam(param, param.token, param.optional, context),
            ),
          )
        : [];
      const instance = new provider.useClass(...args);
      if (provider.singleton) {
        return instance;
      }
      return context.addInstance(instance);
    }

    throw new ProviderTypeError(provider);
  }

  private async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // register self as the Resolver
    this.repository.register({
      provide: Resolver,
      useValue: this,
    });

    this.initialized = true;

    // register explicitly set providers
    // this must happen before scanning so that scanners can be specified in the providers config
    if (this.config.providers) {
      this.registerProviders(this.config.providers);
    }

    await Disposable.useAsync(
      await this.resolve(Scanner, true),
      async (result) => {
        if (!result) {
          return;
        }
        const scanners = result.arrayValue;
        await Promise.all(
          scanners.map(async (scanner: Scanner) => {
            this.scannedRepositories.push(await scanner.scan());
          }),
        );
      },
    );

    // if a logger hasn't already been registered, register the NoopLogger
    await Disposable.useAsync(
      await this.resolve(Logger, true),
      async (result) => {
        if (!result) {
          this.repository.register(NoopLogger);
        }
      },
    );

    await this.onInit();
  }

  private registerProviders(module: any): void {
    if (Array.isArray(module)) {
      module.forEach((provider) => this.registerProviders(provider));
      return;
    }
    this.repository.register(module);
  }

  private async resolveParam<T>(
    param: ParamMetadata<T>,
    token: InjectionToken<T>,
    optional: boolean,
    context: ResolverContext<T>,
  ) {
    return await this.resolveInternal(
      token,
      optional,
      context.childContext(token, null, ...((param && param.providers) || [])),
    );
  }

  private async resolveProvider<T>(
    provider: Provider<T>,
    context: ResolverContext<T>,
  ): Promise<T> {
    if (isValueProvider(provider)) {
      return provider.useValue;
    }
    if (isGeneratingProvider(provider) && provider.singleton) {
      const instance = context.getSingleton(provider);
      if (instance) {
        return instance;
      }
      let request = this.singletonRequests.get(provider);
      if (request) {
        return await request;
      }
      request = this.generate(provider, context);
      this.singletonRequests.set(provider, request);
      const result = context.addSingleton(provider, await request);
      this.singletonRequests.delete(provider);
      return result;
    }

    return await this.generate(provider, context);
  }

  private async resolveInternal<T>(
    token: InjectionToken<T>,
    optional: boolean,
    context: ResolverContext<T>,
  ): Promise<T | T[]> {
    const entry = context.match;

    if (!entry) {
      if (!optional) {
        throw new MissingProviderError(token, context);
      }
      return null;
    }

    if (Array.isArray(entry)) {
      return await Promise.all(
        entry.map((provider) => {
          return this.resolveProvider(
            provider,
            context.childContext(token, getInjectionContext(provider)),
          );
        }),
      );
    }

    return this.resolveProvider(entry, context);
  }
}
