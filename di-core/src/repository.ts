import {
    AppError, Constructor, Disposable, InvalidDisposeTargetError
} from '@dandi/core';

import { globalSymbol }                                 from './global.symbol';
import { InjectionToken }                               from './injection.token';
import { OpinionatedProviderOptionsConflictError, OpinionatedToken } from './opinionated.token';
import { Provider, ProviderOptions, ProviderTypeError } from './provider';
import { isProvider }                                   from './provider.util';

const REPOSITORIES = new Map<any, Repository>();

export interface RegisterOptions<T> extends ProviderOptions<T> {
    provide?: InjectionToken<T>;
}

export type RepositoryEntry<T> = Provider<T> | Provider<T>[];

const GLOBAL_CONTEXT = globalSymbol('Repository:GLOBAL_CONTEXT');

export class InvalidRegistrationTargetError extends AppError {
    constructor(public readonly target: any, public readonly options: any) {
        super('Invalid registration target');
    }
}

export class ConflictingRegistrationOptionsError extends AppError {
    constructor(message: string, public readonly existing: any, public target: any) {
        super(message);
    }
}

export class InvalidRepositoryContextError extends AppError {
    constructor(public readonly context: any) {
        super('A context must be specified');
    }
}

export class Repository<TContext = any> implements Disposable {

    private readonly providers = new Map<InjectionToken<any>, RepositoryEntry<any>>();
    private readonly singletons = new Map<Provider<any>, any>();

    private constructor(private context: any, private readonly allowSingletons: boolean) { }

    public register<T>(target: Constructor<T> | Provider<T>, options?: RegisterOptions<T>): this {
        if (isProvider(target)) {
            this.registerProvider(target);
            return this;
        }

        if (typeof(target) === 'function') {

            const injectableProviderOptions = Reflect.get(target, ProviderOptions.valueOf() as symbol) as ProviderOptions<T>;
            if (injectableProviderOptions) {
                this.registerProvider({
                    provide: options && options.provide || injectableProviderOptions.provide || target,
                    useClass: target,
                    multi: injectableProviderOptions.multi,
                    singleton: injectableProviderOptions.singleton,
                });
                return this;
            }

            this.registerProvider({
                provide: options && options.provide || target,
                useClass: target,
                multi: options && options.multi,
                singleton: options && options.singleton,
            });
            return this;
        }

        throw new InvalidRegistrationTargetError(target, options);

    }

    private registerProvider<T>(provider: Provider<T>, target?: Constructor<T> | Provider<T>) {

        if (provider.provide instanceof OpinionatedToken) {
            const opinionatedOptions = provider.provide.options;
            Object.keys(opinionatedOptions)
                .forEach(optionKey => {
                    const providerValue = provider[optionKey];
                    const opinionatedValue = opinionatedOptions[optionKey];
                    if (providerValue === undefined || providerValue === null) {
                        provider[optionKey] = opinionatedOptions[optionKey];
                        return;
                    }

                    if (providerValue !== opinionatedValue) {
                        throw new OpinionatedProviderOptionsConflictError(provider)
                    }
                });
        }

        let entry: Provider<T> | Provider<T>[] = this.providers.get(provider.provide);

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
                (entry as Provider<T>[]).push(provider);
            } else {
                entry = [provider] as Provider<T>[];
                this.providers.set(provider.provide, entry);
            }
        } else {
            this.providers.set(provider.provide, provider);
        }
    }

    public get<T>(token: InjectionToken<T>): RepositoryEntry<T> {
        return this.providers.get(token);
    }

    public entries(): IterableIterator<RepositoryEntry<any>> {
        return this.providers.values();
    }

    public addSingleton<TSingleton>(provider: Provider<TSingleton>, value: TSingleton): TSingleton {
        if (!this.allowSingletons) {
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

    public static for(context: any): Repository {
        if (!context) {
            throw new InvalidRepositoryContextError(context);
        }
        let repo = REPOSITORIES.get(context);
        if (!repo) {
            repo = new Repository(context, context !== GLOBAL_CONTEXT as any);
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

}
