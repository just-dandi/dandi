import { Constructor, Disposable, InvalidDisposeTargetError } from '@dandi/common'
import { ProviderTypeError } from '@dandi/core/errors'
import { isProvider, getInjectionScopeName } from '@dandi/core/internal/util'
import {
  DependencyInjectionScope,
  InjectionScope,
  InjectionToken,
  OpinionatedProviderOptionsConflictError,
  OpinionatedToken,
  Provider,
  ProviderOptions,
  RegistrationSource,
} from '@dandi/core/types'

import { InvalidRepositoryScopeError, InvalidRegistrationTargetError, ConflictingRegistrationOptionsError } from './repository-errors'

const REPOSITORIES = new Map<InjectionScope, Repository>()

export interface RegisterOptions<T> extends ProviderOptions<T> {
  provide?: InjectionToken<T>
}

export type RepositoryEntry<T> = Provider<T> | Set<Provider<T>>

export const GLOBAL_SCOPE = new DependencyInjectionScope('Repository:GLOBAL_SCOPE')

/**
 * Contains mappings of injection tokens to providers, and stores instances of injectables.
 */
export class Repository implements Disposable {

  public static for(scope: InjectionScope): Repository {
    if (!scope) {
      throw new InvalidRepositoryScopeError(scope)
    }
    let repo = REPOSITORIES.get(scope)
    if (!repo) {
      repo = new Repository(scope, scope !== (GLOBAL_SCOPE as any))
      REPOSITORIES.set(scope, repo)
    }
    return repo
  }

  public static exists(scope: InjectionScope): boolean {
    return REPOSITORIES.has(scope)
  }

  public get allowInstances(): boolean {
    return this._allowInstances
  }

  private readonly registry = new Map<InjectionToken<any>, RepositoryEntry<any>>()
  private readonly instances = new Map<Provider<any>, any>()
  private readonly children = new Map<InjectionScope, Repository>()

  private constructor(private scope: InjectionScope, private readonly _allowInstances: boolean) {}

  public register<T>(source: RegistrationSource, target: Constructor<T> | Provider<T>, options?: RegisterOptions<T>): this {
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

  public get<T>(token: InjectionToken<T>): RepositoryEntry<T> {
    return this.registry.get(token)
  }

  public get providers(): IterableIterator<RepositoryEntry<any>> {
    return this.registry.values()
  }

  public addInstance<TInstance>(provider: Provider<TInstance>, value: TInstance): TInstance {
    if (!this._allowInstances) {
      // TODO: create error type
      throw new Error('Instances are not allowed to be registered on this Repository instance')
    }
    if (!isProvider(provider)) {
      throw new ProviderTypeError(provider)
    }
    this.instances.set(provider, value)
    return value
  }

  public getInstance<TInstance>(provider: Provider<TInstance>): TInstance {
    return this.instances.get(provider)
  }

  public getChild(scope: InjectionScope): Repository {
    if (!scope || scope === GLOBAL_SCOPE) {
      throw new InvalidRepositoryScopeError(scope)
    }
    let repo = this.children.get(scope)
    if (!repo) {
      repo = new Repository(scope, true)
      this.children.set(scope, repo)
    }
    return repo
  }

  public async dispose(reason: string): Promise<void> {
    if (this.scope === GLOBAL_SCOPE) {
      throw new InvalidDisposeTargetError('Cannot dispose global repository')
    }
    Disposable.markDisposing(this, reason)
    this.registry.clear()

    if (this.instances.size) {
      await Promise.all([...this.instances.values()].map((instance) => {
        return Disposable.dispose(instance, `Disposing Repository for ${getInjectionScopeName(this.scope)}: ${reason}`)
      }))
      this.instances.clear()
    }
    REPOSITORIES.delete(this.scope)
    Disposable.remapDisposed(this, reason, { retainProperties: ['scope'] })
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

    let entry: RepositoryEntry<T> = this.registry.get(provider.provide)

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
        this.registry.set(provider.provide, entry)
      }
      (entry as Set<Provider<T>>).add(provider)
    } else {
      this.registry.set(provider.provide, provider)
    }
  }
}
