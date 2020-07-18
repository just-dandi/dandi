import { isConstructor } from '@dandi/common'
import { InjectionScope, InjectionToken, InjectorContext, Registerable } from '@dandi/core'
import { DandiInjectorContext, FindCacheEntry, RepositoryEntry } from '@dandi/core/internal'

import { stubProvider } from './stub-provider'

const stubProviders = new Map<InjectionToken<any>, RepositoryEntry<any>>()

export class StubInjectorContext extends DandiInjectorContext {
  constructor(parent: DandiInjectorContext, scope: InjectionScope, providers: Registerable[] = []) {
    super(parent, scope, providers)
  }

  protected doFind<T>(token: InjectionToken<T>, entryContext: InjectorContext): FindCacheEntry<T> {
    const result = super.doFind(token, entryContext)
    if (result) {
      return result
    }

    if (isConstructor(token)) {
      let provider = stubProviders.get(token)
      if (!provider) {
        provider = stubProvider(token)
        stubProviders.set(token, provider)
      }
      return {
        entry: provider,
        context: this,
      }
    }

    return result
  }

  // protected findInstanceContext(matchContext: DandiInjectorContext, scope?: InjectionScope): DandiInjectorContext {
  //   const baseResult = super.findInstanceContext(matchContext, scope)
  //   if (baseResult) {
  //     return baseResult
  //   }
  // }
}
