import { Constructor } from '@dandi/common'

import { Module, Registerable } from './module'

/**
 * A utility subclass of [[Module]] that makes it easier to define and modify package modules
 */
export class ModuleBuilder<TBuilder extends ModuleBuilder<TBuilder>> extends Module {
  protected constructor(private cloneCtr: Constructor<TBuilder>, pkg: string, ...entries: Registerable[]) {
    super(pkg, ...entries)
  }

  /**
   * Either adds the specified `entries` to the instance, or if a `cloneCtr` was configured during instantiation,
   * creates a cloned instance with the additional entries.
   * @param entries
   */
  protected add(...entries: Registerable[]): this {
    const builder = this.cloneCtr ? new this.cloneCtr(...this) : this;
    (builder as ModuleBuilder<TBuilder>).cloneCtr = undefined
    this.tag(entries)
    builder.push(...entries)
    return builder as this
  }
}
