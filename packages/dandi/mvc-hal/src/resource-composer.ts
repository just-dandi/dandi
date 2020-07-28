import { ComposedResource } from '@dandi/hal'

import { CompositionContext } from './composition-context'
import { localToken } from './local-token'

export interface ResourceComposer {
  compose<T>(resource: T, parentContext: CompositionContext): Promise<ComposedResource<T>>
}

export const ResourceComposer = localToken.opinionated<ResourceComposer>('ResourceComposer', {
  multi: false,
})
