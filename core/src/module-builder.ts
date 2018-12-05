import { Constructor } from '@dandi/common';

import { Module, Registerable } from './module';

export class ModuleBuilder<TBuilder extends ModuleBuilder<TBuilder>> extends Module {
  protected constructor(private readonly cloneCtr: Constructor<TBuilder>, pkg: string, ...entries: Registerable[]) {
    super(pkg, ...entries);
  }

  public add(...entries: Registerable[]): this {
    const builder = this.cloneCtr ? new this.cloneCtr(...this) : this;
    this.tag(entries);
    builder.push(...entries);
    return builder as this;
  }
}
