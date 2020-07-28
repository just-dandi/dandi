import { InjectionToken } from '@dandi/core'

import { localToken } from './local-token'

export interface BeforeInvokeHandler {
  onBeforeInvoke(): void | Promise<void>
}

export const BeforeInvokeHandler: InjectionToken<BeforeInvokeHandler> = localToken.opinionated<BeforeInvokeHandler>(
  'BeforeInvokeHandler',
  {
    multi: true,
  },
)
