import { InjectionToken } from '@dandi/core'
import { ComposedResource } from '@dandi/hal'

import { CompositionContext } from './composition.context'
import { localOpinionatedToken } from './local.token'

export interface ResourceComposer {
  compose<T>(resource: T, parentContext: CompositionContext): Promise<ComposedResource<T>>;
}

export const ResourceComposer: InjectionToken<ResourceComposer> = localOpinionatedToken('ResourceComposer', {
  multi: false,
})
