import { Constructor, Disposable, InvalidDisposeTargetError } from '@dandi/common';

import { globalSymbol } from './global.symbol';
import { InjectionToken } from './injection.token';
import { OpinionatedProviderOptionsConflictError, OpinionatedToken } from './opinionated.token';
import { Provider, ProviderOptions } from './provider';
import { ProviderTypeError } from './provider.type.error';
import { isProvider } from './provider.util';
import {
  ConflictingRegistrationOptionsError,
  InvalidRegistrationTargetError,
  InvalidRepositoryContextError,
} from './repository.errors';

const REPOSITORIES = new Map<any, Repository>();

export interface RegisterOptions<T> extends ProviderOptions<T> {
  provide?: InjectionToken<T>;
}

export type RepositoryEntry<T> = Provider<T> | Array<Provider<T>>;

const GLOBAL_CONTEXT = globalSymbol('Repository:GLOBAL_CONTEXT');

export class Repository<TContext = any> implements Disposable {
  public static for(context: any): Repository {
    if (!context) {
      throw new InvalidRepositoryContextError(context);
    }
    let repo = REPOSITORIES.get(context);
    if (!repo) {
      repo = new Repository(context, context !== (GLOBAL_CONTEXT as any));
      REPOSITORIES.set(context, repo);
    }
    return repo;
  }

  public static exists(context: any): boolean {
    return REPOSITORIES.has(context);
  }

  public static get global(): Repository {
    return this.for(GLOBAL_CONTEXT);
  }

  public get allowSingletons(): boolean {
    return this._allowSingletons;
  }

  private readonly providers = new Map<InjectionToken<any>, RepositoryEntry<any>>();

  private readonly singletons = new Map<Provider<any>, any>();

  private constructor(private context: any, private readonly _allowSingletons: boolean) {}

  public register<T>(target: Constructor<T> | Provider<T>, options?: RegisterOptions<T>): this {
    if (isProvider(target)) {
      this.registerProvider(target);
      return this;
    }

    if (typeof target === 'function') {
      const injectableProviderOptions = Reflect.get(target, ProviderOptions.valueOf() as symbol) as ProviderOptions<T>;
      const effectiveOptions = Object.assign({}, injectableProviderOptions, options);
      const provide = effectiveOptions.provide || target;
      const noSelf = effectiveOptions.noSelf;
      const provider = Object.assign(
        {
          useClass: target,
        },
        effectiveOptions,
      );

      this.registerProvider(Object.assign({}, provider, { provide }));
      if (provide !== target && !noSelf) {
        this.registerProvider(Object.assign({}, provider, { provide: target }));
      }
      return this;
    }

    throw new InvalidRegistrationTargetError(target, options);
  }

  public registerProviders(...providers: Provider<any>[]): void {
    providers.forEach((provider) => this.registerProvider(provider));
  }

  public get<T>(token: InjectionToken<T>): RepositoryEntry<T> {
    return this.providers.get(token);
  }

  public entries(): IterableIterator<RepositoryEntry<any>> {
    return this.providers.values();
  }

  public addSingleton<TSingleton>(provider: Provider<TSingleton>, value: TSingleton): TSingleton {
    if (!this._allowSingletons) {
      throw new Error('Singletons are not allowed to be registered on this Repository instance');
    }
    if (!isProvider(provider)) {
      throw new ProviderTypeError(provider);
    }
    this.singletons.set(provider, value);
    return value;
  }

  public getSingleton<TSingleton>(provider: Provider<TSingleton>): TSingleton {
    return this.singletons.get(provider);
  }

  public dispose(reason: string): void {
    if (this.context === GLOBAL_CONTEXT) {
      throw new InvalidDisposeTargetError('Cannot dispose global repository');
    }
    this.providers.clear();
    this.singletons.clear();
    REPOSITORIES.delete(this.context);
    Disposable.remapDisposed(this, reason);
  }

  private registerProvider<T>(provider: Provider<T>, target?: Constructor<T> | Provider<T>) {
    if (provider.provide instanceof OpinionatedToken) {
      const opinionatedOptions = provider.provide.options;
      Object.keys(opinionatedOptions).forEach((optionKey) => {
        const providerValue = provider[optionKey];
        const opinionatedValue = opinionatedOptions[optionKey];
        if (providerValue === undefined || providerValue === null) {
          provider[optionKey] = opinionatedOptions[optionKey];
          return;
        }

        if (providerValue !== opinionatedValue) {
          throw new OpinionatedProviderOptionsConflictError(provider);
        }
      });
    }

    let entry: Provider<T> | Array<Provider<T>> = this.providers.get(provider.provide);

    if (entry) {
      const entryIsMulti = entry && Array.isArray(entry);

      if (provider.multi && !entryIsMulti) {
        throw new ConflictingRegistrationOptionsError(
          `${target || provider} specified multi option, but already had existing registrations without multi`,
          entry,
          target,
        );
      }

      if (!provider.multi && entryIsMulti) {
        throw new ConflictingRegistrationOptionsError(
          `Existing entries for ${provider.provide} specified multi option, but ${target || provider} did not`,
          entry,
          target,
        );
      }
    }

    if (provider.multi) {
      if (entry) {
        (entry as Array<Provider<T>>).push(provider);
      } else {
        entry = [provider] as Array<Provider<T>>;
        this.providers.set(provider.provide, entry);
      }
    } else {
      this.providers.set(provider.provide, provider);
    }
  }
}
