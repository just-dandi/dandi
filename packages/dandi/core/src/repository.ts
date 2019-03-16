import { Constructor, Disposable, InvalidDisposeTargetError } from '@dandi/common'

import { globalSymbol } from './global-symbol'
import { InjectionToken } from './injection-token'
import { OpinionatedProviderOptionsConflictError, OpinionatedToken } from './opinionated-token'
import { Provider, ProviderOptions } from './provider'
import { ProviderTypeError } from './provider-type-error'
import { isProvider } from './provider-util'
import {
  ConflictingRegistrationOptionsError,
  InvalidRegistrationTargetError,
  InvalidRepositoryContextError,
} from './repository-errors'
import { RepositoryRegistrationSource } from './repository-registration'

const REPOSITORIES = new Map<any, Repository>()

export interface RegisterOptions<T> extends ProviderOptions<T> {
  provide?: InjectionToken<T>
}

export type RepositoryEntry<T> = Provider<T> | Set<Provider<T>>

const GLOBAL_CONTEXT = globalSymbol('Repository:GLOBAL_CONTEXT')

/**
 * @internal
 * Contains mappings of injection tokens to providers, and stores instances of singletons.
 */
export class Repository<TContext = any> implements Disposable {

  /**
   * Creates or returns a [[Repository]] instance tied to the specified `context`.
   *
   * Only one [[Repository]] instance may exist per `context` value. When the [[Repository]] is disposed, it is
   * disassociated from the `context`, and a new instance may be created.
   *
   * @param context An object or value used to uniquely identify the [[Repository]] instance
   */
  public static for(context: any): Repository {
    if (!context) {
      throw new InvalidRepositoryContextError(context)
    }
    let repo = REPOSITORIES.get(context)
    if (!repo) {
      repo = new Repository(context, context !== (GLOBAL_CONTEXT as any))
      REPOSITORIES.set(context, repo)
    }
    return repo
  }

  /**
   * Returns `true` if there is an existing [[Repository]] instance for the specified `context`; otherwise, `false`.
   * @param context
   */
  public static exists(context: any): boolean {
    return REPOSITORIES.has(context)
  }

  /**
   * Gets a reference the global [[Repository]] instance.
   *
   * The global [[Repository]] instance is used to hold a collection of classes decorated with [[Injectable]], and is
   * used by [[AmbientInjectableScanner]] to automatically include [[Injectable]]s from JavaScript and TypeScript
   * modules that are statically referenced by the application's source code.
   */
  public static get global(): Repository {
    return this.for(GLOBAL_CONTEXT)
  }

  /**
   * The global [[Repository]] instance does not allow singletons to be stored; all others do.
   */
  public get allowSingletons(): boolean {
    return this._allowSingletons
  }

  private readonly providers = new Map<InjectionToken<any>, RepositoryEntry<any>>()

  private readonly singletons = new Map<Provider<any>, any>()

  private constructor(private context: any, private readonly _allowSingletons: boolean) {}

  /**
   * @internal
   * Registers the specified [[Constructor]] or [[Provider]]. If `target` is a [[Constructor]], a [[ClassProvider]] is
   * created.
   * @param source
   * @param target
   * @param options
   */
  public register<T>(source: RepositoryRegistrationSource, target: Constructor<T> | Provider<T>, options?: RegisterOptions<T>): this {
    if (isProvider(target)) {
      this.registerProvider(target)
      return this
    }

    if (typeof target === 'function') {
      const injectableProviderOptions = Reflect.get(target, ProviderOptions.valueOf() as symbol) as ProviderOptions<T>
      const effectiveOptions = Object.assign({}, injectableProviderOptions, options)
      const provide = effectiveOptions.provide || target
      const noSelf = effectiveOptions.noSelf
      const provider = Object.assign(
        {
          useClass: target,
        },
        effectiveOptions,
      )

      this.registerProvider(Object.assign({}, provider, { provide }))
      if (provide !== target && !noSelf) {
        this.registerProvider(Object.assign({}, provider, { provide: target }))
      }
      return this
    }

    throw new InvalidRegistrationTargetError(source, target, options)
  }

  /**
   * Gets the configured [[RepositoryEntry]] for the specified `token`
   * @param token
   */
  public get<T>(token: InjectionToken<T>): RepositoryEntry<T> {
    return this.providers.get(token)
  }

  /**
   * Gets the current collection of registered [[RepositoryEntry]] objects.
   */
  public entries(): IterableIterator<RepositoryEntry<any>> {
    return this.providers.values()
  }

  /**
   * Registers a singleton instance for the specified `provider`.
   *
   * @param provider
   * @param value
   */
  public addSingleton<TSingleton>(provider: Provider<TSingleton>, value: TSingleton): TSingleton {
    if (!this._allowSingletons) {
      throw new Error('Singletons are not allowed to be registered on this Repository instance')
    }
    if (!isProvider(provider)) {
      throw new ProviderTypeError(provider)
    }
    this.singletons.set(provider, value)
    return value
  }

  /**
   * Gets the singleton instance registered to the specified `provider` if it exists. Returns `undefined` if no
   * singleton has been registered yet.
   *
   * @param provider
   */
  public getSingleton<TSingleton>(provider: Provider<TSingleton>): TSingleton {
    return this.singletons.get(provider)
  }

  /**
   * Disposes of the instance, removing all providers and singleton objects, and removes the association between the
   * instance and the `context` value used when it was created.
   *
   * The global [[Repository]] instance cannot be disposed.
   *
   * @param reason A brief description of why the object is being disposed
   */
  public dispose(reason: string): void {
    if (this.context === GLOBAL_CONTEXT) {
      throw new InvalidDisposeTargetError('Cannot dispose global repository')
    }
    this.providers.clear()
    this.singletons.clear()
    REPOSITORIES.delete(this.context)
    Disposable.remapDisposed(this, reason)
  }

  private registerProvider<T>(provider: Provider<T>, target?: Constructor<T> | Provider<T>): void {
    if (provider.provide instanceof OpinionatedToken) {
      const opinionatedOptions = provider.provide.options
      Object.keys(opinionatedOptions).forEach((optionKey) => {
        const providerValue = provider[optionKey]
        const opinionatedValue = opinionatedOptions[optionKey]
        if (providerValue === undefined || providerValue === null) {
          provider[optionKey] = opinionatedOptions[optionKey]
          return
        }

        if (providerValue !== opinionatedValue) {
          throw new OpinionatedProviderOptionsConflictError(provider)
        }
      })
    }

    let entry: RepositoryEntry<T> = this.providers.get(provider.provide)

    if (entry) {
      const entryIsMulti = entry instanceof Set

      if (provider.multi && !entryIsMulti) {
        throw new ConflictingRegistrationOptionsError(
          `${target || provider} specified multi option, but already had existing registrations without multi`,
          entry,
          target,
        )
      }

      if (!provider.multi && entryIsMulti) {
        throw new ConflictingRegistrationOptionsError(
          `Existing entries for ${provider.provide} specified multi option, but ${target || provider} did not`,
          entry,
          target,
        )
      }
    }

    if (provider.multi) {
      if (!entry) {
        entry = new Set<Provider<T>>()
        this.providers.set(provider.provide, entry)
      }
      (entry as Set<Provider<T>>).add(provider)
    } else {
      this.providers.set(provider.provide, provider)
    }
  }
}
