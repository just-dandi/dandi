import { InjectionToken, InjectorContext } from '@dandi/core/types'

import { DandiInjectionError } from './dandi-injection-error'

export class MissingProviderError<T> extends DandiInjectionError<T> {
  constructor(public readonly token: InjectionToken<T>, public readonly context: InjectorContext) {
    super(token, context, 'No provider for')
  }
}
