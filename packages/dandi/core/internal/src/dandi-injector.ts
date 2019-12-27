import { Disposable, isConstructor } from '@dandi/common'
import { MissingTokenError, InvalidTokenError, MissingProviderError } from '@dandi/core/errors'
import {
  getInjectableMetadata,
  getInjectionScopeName,
  getInjectionScopeVerb,
  isInjectionToken, isProvider,
} from '@dandi/core/internal/util'
import {
  DependencyInjectionScope,
  InjectionResult,
  InjectionScope,
  InjectionToken,
  Injector,
  InstanceGenerator,
  InstanceGeneratorFactory,
  InstanceInvokableFn,
  InvokableFn,
  InvokeInjectionScope,
  Registerable,
  ResolvedProvider,
  ResolverContext,
  InjectorContextConstructor,
} from '@dandi/core/types'

import { DandiInjectorContext } from './dandi-injector-context'
import { DandiResolverContext } from './dandi-resolver-context'
import { RepositoryEntry } from './repository'

interface Args<T> {
  token: InjectionToken<T>
  optional: boolean
  providers: Registerable[]
  noToken?: boolean
}
type KnownArgs<T> = { [TProp in keyof Args<T>]?: Args<T>[TProp] }

const PARSE_ARGS_A1 = 0
const PARSE_ARGS_PROVIDERS_START = 1

export class DandiInjector implements Injector, Disposable {

  private readonly children: Array<DandiInjector> = []

  protected generator: InstanceGenerator
  protected readonly generatorReady: Promise<void>

  public readonly context: DandiInjectorContext

  protected constructor(
    protected readonly scope: InjectionScope,
    protected readonly parent: DandiInjector,
    private readonly generatorFactory: InstanceGeneratorFactory,
    protected readonly injectorContextConstructor: InjectorContextConstructor,
    providers: Registerable[],
  ) {
    this.context = parent.context.createChild(scope,
      {
        provide: Injector,
        useValue: this,
      },
      ...providers || [],
    )
    this.generatorReady = this.initGeneratorFactory(generatorFactory)
  }

  public canResolve(token: InjectionToken<any>, ...providers: Registerable[]): boolean {
    const injectionScope: InvokeInjectionScope = { instance: this, methodName: 'canResolve' }
    return Disposable.use(this.createChild(injectionScope, providers), injector => {
      return !!injector.resolveInternal(this.parseAndValidateArgs({
        token,
        optional: true,
        providers,
      })).match
    })
  }

  public resolve<T>(token: InjectionToken<T>, ...providers: Registerable[]): ResolvedProvider<T>
  public resolve<T>(token: InjectionToken<T>, optional: boolean, ...providers: Registerable[]): ResolvedProvider<T>
  resolve<T>(token: InjectionToken<T>, ...args: any[]): ResolvedProvider<T> {
    const injectionScope: InvokeInjectionScope = { instance: this, methodName: 'resolve' }
    const parsedArgs = this.parseAndValidateArgs({ token }, ...args)
    return Disposable.use(this.createChild(injectionScope, parsedArgs.providers), injector => {
      return injector.resolveInternal(parsedArgs).match
    })
  }

  public inject<T>(token: InjectionToken<T>, ...providers: Registerable[]): Promise<InjectionResult<T>>
  public inject<T>(token: InjectionToken<T>, optional: boolean, ...providers: Registerable[]): Promise<InjectionResult<T>>
  async inject<T>(token: InjectionToken<T>, ...args: any[]): Promise<InjectionResult<T>> {
    const injectArgs: Args<T> = this.parseAndValidateArgs({ token }, ...args)
    const injectionScope: InvokeInjectionScope = { instance: this, methodName: 'inject' }
    // FIXME: where/when does the injector get disposed?
    const injector = this.createChild(injectionScope, injectArgs.providers)
    const resolverContext: ResolverContext<T> = injector.resolveInternal(injectArgs)

    if (!resolverContext.match) {
      await Disposable.dispose(resolverContext, 'Disposed after resolving to an undefined provider')
      return undefined
    }

    try {
      const result = await injector.generateInstance(resolverContext)
      if (result === undefined || result === null) {
        await Disposable.dispose(resolverContext, 'Disposed after generating a null or undefined instance value')
        return undefined
      }
      return resolverContext.resolveValue(result)
    } catch (err) {
      await Disposable.dispose(resolverContext, `Error during inject: ${err.message}`)
      throw err
    }
  }

  public async invoke<TInstance extends object, TResult>(
    instance: TInstance,
    methodName: InstanceInvokableFn<TInstance, TResult>,
    ...providers: Registerable[]
  ): Promise<TResult> {
    const invokeInjectionScope: InvokeInjectionScope = { instance, methodName: methodName.toString() }
    this.generator || await this.generatorReady
    return await Disposable.useAsync(this.createChild(invokeInjectionScope, providers), async (injector) => {
      return await injector.invokeInternal(instance, methodName)
    })
  }

  public async injectParam<T>(
    token: InjectionToken<T>,
    optional: boolean,
    providers: Registerable[],
    scope: InjectionScope,
  ): Promise<T | T[]> {
    const injector = this.createChild(scope, providers)
    const paramResolverContext = injector.createResolverContext(token)
    this.validateResolution(token, optional, paramResolverContext)
    return await injector.generateInstance(paramResolverContext)
  }

  public async dispose(reason: string): Promise<void> {
    const injectorReason = `${reason}\n\t${getInjectionScopeVerb(this.scope)} ${getInjectionScopeName(this.scope)}`
    await Promise.all(this.children.map((child) => {
      if (!Disposable.isDisposed(child)) {
        return child.dispose(`Disposing parent Injector: ${injectorReason}`)
      }
    }))
    this.children.length = 0
    await this.context.dispose(injectorReason)
    Disposable.remapDisposed(this, reason)
  }

  public createChild(scope: InjectionScope, providers?: Registerable[]): DandiInjector {
    const child = new DandiInjector(scope, this, this.generatorFactory, this.injectorContextConstructor, providers)
    this.children.push(child)
    return child
  }

  public createResolverContext<T>(
    token: InjectionToken<T>,
  ): ResolverContext<T> {
    return new DandiResolverContext(token, this.context)
  }

  protected async invokeInternal<TInstance extends object, TResult>(
    instance: TInstance,
    methodName: InstanceInvokableFn<TInstance, TResult>,
  ): Promise<TResult> {
    const method: InvokableFn<TResult> = instance[methodName] as unknown as InvokableFn<TResult>
    const meta = getInjectableMetadata(method)
    this.generator || await this.generatorReady
    const invokeTargetArgs = (meta.params && meta.params.length)
      ? await Promise.all(meta.params.map(param => {
        const paramScope = new DependencyInjectionScope(instance, methodName as string, param.name)
        return this.injectParam(
          param.token,
          param.optional,
          [...param.providers || []],
          paramScope)
        },
      ))
      : []
    return await method.apply(instance, invokeTargetArgs)
  }

  private async initGeneratorFactory(generatorFactory: InstanceGeneratorFactory): Promise<void> {
    this.generator = await (typeof generatorFactory === 'function' ? generatorFactory() : generatorFactory)
  }

  private parseAndValidateArgs<T>(knownArgs: KnownArgs<T>, ...args: any[]): Args<T> {
    if (!knownArgs.token && !knownArgs.noToken) {
      throw new MissingTokenError()
    }
    if (knownArgs.token && !isInjectionToken(knownArgs.token)) {
      throw new InvalidTokenError(knownArgs.token)
    }

    if (!knownArgs.providers) {
      knownArgs.providers = args.slice(PARSE_ARGS_PROVIDERS_START)
    }

    const a1 = args[PARSE_ARGS_A1]
    if (typeof a1 === 'boolean') {
      knownArgs.optional = a1
    } else if (isConstructor(a1) || isProvider(a1)) {
      knownArgs.providers.unshift(a1)
    }

    return knownArgs as Args<T>
  }

  private resolveInternal<T>(args: Args<T>): ResolverContext<T> {
    const resolverContext = this.createResolverContext(args.token)
    try {
      this.validateResolution(args.token, args.optional, resolverContext)
    } catch (err) {
      Disposable.dispose(resolverContext, `Container error during resolve(): ${err.message}`)
      throw err
    }
    return resolverContext
  }

  private validateResolution<T>(
    token: InjectionToken<T>,
    optional: boolean,
    resolverContext: ResolverContext<T>,
  ): RepositoryEntry<T> {
    const entry = resolverContext.match

    if (!entry && !optional) {
      throw new MissingProviderError(token, resolverContext)
    }

    return entry
  }

  private async generateInstance<T>(resolverContext: ResolverContext<T>): Promise<T | T[]> {
    this.generator || await this.generatorReady
    return await this.generator.generateInstance(this, resolverContext)
  }

}
