import { Constructor } from '@dandi/common'

import { Module, Registerable } from './module'

export class ModuleBuilder<TBuilder extends ModuleBuilder<TBuilder>> extends Module {
  protected constructor(private cloneCtr: Constructor<TBuilder>, pkg: string, ...entries: Registerable[]) {
    super(pkg, ...entries)
  }

  protected add(...entries: Registerable[]): this {
    const builder = this.cloneCtr ? new this.cloneCtr(...this) : this;
    (builder as ModuleBuilder<TBuilder>).cloneCtr = undefined
    this.tag(entries)
    builder.push(...entries)
    return builder as this
  }
}
