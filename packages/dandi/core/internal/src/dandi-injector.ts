import { Disposable } from '@dandi/common'
import {
  DandiInjectionError,
  MissingTokenError,
  InvalidTokenError,
  InvalidTokenScopeError,
  MissingProviderError,
} from '@dandi/core/errors'
import {
  getInjectableMetadata,
  getInjectionScopeName,
  getInjectionScopeVerb,
  getRestrictedScope,
  getScopeRestriction,
  isInjectionToken,
  scopesAreCompatible,
} from '@dandi/core/internal/util'
import {
  DependencyInjectionScope,
  InjectionScope,
  InjectionToken,
  Injector,
  InjectorContextConstructor,
  InstanceGenerator,
  InstanceGeneratorFactory,
  InstanceInvokableFn,
  InvokableFn,
  InvokeInjectionScope,
  MultiInjectionToken,
  OpinionatedToken,
  Registerable,
  ResolvedProvider,
  ResolverContext,
  SingleInjectionToken,
} from '@dandi/core/types'

import { DandiInjectorContext } from './dandi-injector-context'
import { DandiResolverContext } from './dandi-resolver-context'
import { RepositoryEntry } from './repository'

interface Args<T> {
  token: InjectionToken<T>
  optional: boolean
  noToken?: boolean
  useScopeTag?: symbol
}
type KnownArgs<T> = { [TProp in keyof Args<T>]?: Args<T>[TProp] }

/**
 * @internal
 */
export class DandiInjector implements Injector, Disposable {
  public readonly context: DandiInjectorContext

  protected generator: InstanceGenerator
  protected readonly generatorReady: Promise<void>

  private readonly children: Set<DandiInjector> = new Set<DandiInjector>()

  protected constructor(
    public readonly parent: DandiInjector,
    protected readonly scope: InjectionScope,
    private readonly generatorFactory: InstanceGeneratorFactory,
    protected readonly injectorContextConstructor: InjectorContextConstructor,
    providers: Registerable[],
  ) {
    if (parent) {
      this.context = parent.context.createChild(
        scope,
        {
          provide: Injector,
          useValue: this,
        },
        ...(providers || []),
      )
    }
    this.generatorReady = this.initGeneratorFactory(generatorFactory)
  }

  public canResolve(token: InjectionToken<any>): boolean {
    return !!this.resolve(token, true)
  }

  public resolve<T>(token: InjectionToken<T>, optional?: boolean): ResolvedProvider<T> {
    const parsedArgs = this.parseAndValidateArgs({ token, optional })
    return this.resolveInternal(parsedArgs)?.match
  }

  public async inject<T>(token: MultiInjectionToken<T>): Promise<T[]>
  public async inject<T>(token: SingleInjectionToken<T>, optional?: boolean): Promise<T>
  public async inject<T>(token: InjectionToken<T>, optional?: boolean): Promise<T | T[]>
  public async inject<T>(token: InjectionToken<T>, optional?: boolean): Promise<T | T[]> {
    try {
      const injectArgs: Args<T> = this.parseAndValidateArgs({ token, optional })
      const resolverContext: ResolverContext<T> = this.resolveInternal(injectArgs)

      if (!resolverContext) {
        return undefined
      }

      const result = await this.generateInstance(resolverContext)
      if (result === undefined || result === null) {
        return undefined
      }
      return resolverContext.resolveValue(result)
    } catch (err) {
      if (err instanceof DandiInjectionError) {
        throw err
      }
      throw new DandiInjectionError(token, this.context, `${err.message} while injecting`, err)
    }
  }

  public async invoke<TInstance extends object, TResult>(
    instance: TInstance,
    methodName: InstanceInvokableFn<TInstance, TResult>,
    ...providers: Registerable[]
  ): Promise<TResult> {
    const invokeInjectionScope: InvokeInjectionScope = { instance, methodName: methodName.toString() }
    return await Disposable.useAsync(this.createChild(invokeInjectionScope, providers), async (injector) => {
      return await injector.invokeInternal(instance, methodName)
    })
  }

  public async dispose(reason: string): Promise<void> {
    Disposable.markDisposing(this, reason)
    const [originalReason, ...reasonStack] = reason.split('\n\t')
    reasonStack.unshift(`while ${getInjectionScopeVerb(this.scope)} ${getInjectionScopeName(this.scope)}`)
    const injectorReason = [originalReason, ...reasonStack].join('\n\t')
    await Promise.all(
      [...this.children].map((child) => {
        if (Disposable.canDispose(child)) {
          const prefix = reason.startsWith('Disposing parent Injector ') ? '' : 'Disposing parent Injector '
          return child.dispose(`${prefix}${injectorReason}`)
        }
      }),
    )
    this.children.clear()
    if (this.parent) {
      this.parent.children.delete(this)
    }
    await this.context.dispose(injectorReason)
    Disposable.remapDisposed(this, reason)
  }

  public createChild(scope: InjectionScope, providers: Registerable[] = []): DandiInjector {
    const child = new DandiInjector(this, scope, this.generatorFactory, this.injectorContextConstructor, providers)
    this.children.add(child)
    return child
  }

  protected async invokeInternal<TInstance extends object, TResult>(
    instance: TInstance,
    methodName: InstanceInvokableFn<TInstance, TResult>,
  ): Promise<TResult> {
    const method: InvokableFn<TResult> = (instance[methodName] as unknown) as InvokableFn<TResult>
    const meta = getInjectableMetadata(method)
    const invokeTargetArgs =
      meta.params && meta.params.length
        ? await Promise.all(
            meta.params.map(async (param) => {
              const paramScope = new DependencyInjectionScope(instance, methodName as string, param.name)
              const paramInjector = this.createChild(paramScope, param.providers)
              return await paramInjector.inject(param.token, param.optional)
            }),
          )
        : []
    return await method.apply(instance, invokeTargetArgs)
  }

  private async initGeneratorFactory(generatorFactory: InstanceGeneratorFactory): Promise<void> {
    this.generator = await (typeof generatorFactory === 'function' ? generatorFactory() : generatorFactory)
  }

  private parseAndValidateArgs<T>(knownArgs: KnownArgs<T>): Args<T> {
    if (!knownArgs.token && !knownArgs.noToken) {
      throw new MissingTokenError()
    }
    if (knownArgs.token && !isInjectionToken(knownArgs.token)) {
      throw new InvalidTokenError(knownArgs.token)
    }
    if (knownArgs.token instanceof OpinionatedToken && !this.validateScope(knownArgs.token)) {
      throw new InvalidTokenScopeError(knownArgs.token)
    }

    return knownArgs as Args<T>
  }

  private validateScope<T>(token: OpinionatedToken<T>): boolean {
    const restriction = getScopeRestriction(token)
    const restrictedScope = getRestrictedScope(restriction)
    if (!restrictedScope) {
      return true
    }

    return scopesAreCompatible(this.scope, restrictedScope) || this.parent?.validateScope(token) || false
  }

  private resolveInternal<T>(args: Args<T>): ResolverContext<T> {
    const resolverContext = this.context.find(args.token)
    this.validateResolution(args.token, args.optional, resolverContext, this.context)
    return resolverContext
  }

  private validateResolution<T>(
    token: InjectionToken<T>,
    optional: boolean,
    resolverContext: DandiResolverContext<T>,
    injectorContext: DandiInjectorContext,
  ): RepositoryEntry<T> {
    const entry = resolverContext?.match

    if (!entry && !optional) {
      throw new MissingProviderError(token, injectorContext)
    }

    return entry
  }

  private async generateInstance<T>(resolverContext: ResolverContext<T>): Promise<T | T[]> {
    this.generator || (await this.generatorReady)
    return await this.generator.generateInstance(this, resolverContext)
  }
}
