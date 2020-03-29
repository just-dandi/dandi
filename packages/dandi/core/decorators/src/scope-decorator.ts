import { CreateScopeFn, getInjectableMetadata } from '@dandi/core/internal/util'

export function Scope(scopeFn: CreateScopeFn): ClassDecorator & MethodDecorator {
  return function scopeDecorator(target: any, propertyKey?: string): void {
    const metaTarget = propertyKey ? target[propertyKey] : target.constructor
    const meta = getInjectableMetadata(metaTarget)
    if (meta.scopeFn && meta.scopeFn !== scopeFn) {
      throw Error(`Decorator Error: ${metaTarget} already has scopeFn ${scopeFn} defined`)
    }
    meta.scopeFn = scopeFn
  }
}
