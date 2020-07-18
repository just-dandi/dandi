import { Constructor } from '@dandi/common'
import { DandiModule } from '@dandi/core/internal'
import { Registerable } from '@dandi/core/types'

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
}
