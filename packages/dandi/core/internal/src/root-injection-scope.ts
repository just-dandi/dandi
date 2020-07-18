import { DependencyInjectionScope } from '@dandi/core/types'

/**
 * @internal
 * Represents the root-level injection scope. This is generally only used directly for app initialization, and
 * as the parent of {@link AppInjectionScope}
 */
export class RootInjectionScope extends DependencyInjectionScope {
  private static readonly value = '[RootInjector]'

  constructor() {
    super(RootInjectionScope)
  }

  public getValue(): string {
    return RootInjectionScope.value
  }
}

/**
 * @internal
 */
export class AppInjectionScope extends DependencyInjectionScope {
  private static readonly value = '[AppInjector]'

  constructor() {
    super(AppInjectionScope)
  }

  public getValue(): string {
    return AppInjectionScope.value
  }
}
