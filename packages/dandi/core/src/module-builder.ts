import { Constructor } from '@dandi/common'
import { DandiModule } from '@dandi/core/internal'
import { InjectionToken, OnConfig, Registerable, FactoryProviderArgs } from '@dandi/core/types'

export class ModuleBuilder<TBuilder extends ModuleBuilder<TBuilder>> extends DandiModule {
  protected constructor(private cloneCtr: Constructor<TBuilder>, pkg: string, ...entries: Registerable[]) {
    super(pkg, ...entries)
  }

  protected add(...entries: Registerable[]): this {
    const builder = this.cloneCtr ? new this.cloneCtr(...this) : this
    ;(builder as ModuleBuilder<TBuilder>).cloneCtr = undefined
    this.tag(entries)
    builder.push(...entries)
    return builder as this
  }

  protected onConfig<T>(deps: [InjectionToken<T>], fn: (arg: T) => void)
  protected onConfig<T1, T2>(deps: [InjectionToken<T1>, InjectionToken<T2>], fn: (arg1: T1, arg2: T2) => void)
  protected onConfig<T1, T2, T3>(
    deps: [InjectionToken<T1>, InjectionToken<T2>, InjectionToken<T3>],
    fn: (arg1: T1, arg2, T2, arg3: T3) => void,
  )

  protected onConfig<T1, T2, T3, T4>(
    deps: [InjectionToken<T1>, InjectionToken<T2>, InjectionToken<T3>, InjectionToken<T4>],
    fn: (arg1: T1, arg2, T2, arg3: T3, arg4: T4) => void,
  )

  protected onConfig<T1, T2, T3, T4, T5>(
    deps: [InjectionToken<T1>, InjectionToken<T2>, InjectionToken<T3>, InjectionToken<T4>, InjectionToken<T5>],
    fn: (arg1: T1, arg2, T2, arg3: T3, arg4: T4, T5) => void,
  )

  protected onConfig<
    TDeps extends [...InjectionToken<any>[]],
    TFn extends (...args: FactoryProviderArgs<TDeps>) => void
  >(deps: TDeps, fn: TFn): void

  protected onConfig(deps: [...InjectionToken<any>[]], fn: (...args: any[]) => void): void {
    this.push({
      provide: OnConfig,
      useFactory: (...args: any) => () => fn(...args),
      deps,
    })
  }
}
