import { NodeOptions } from '@sentry/node'

import { localToken } from './local-token'

export type SentryOptions = NodeOptions
export const SentryOptions = localToken.opinionated<SentryOptions>('SentryOptions', {
  multi: true,
})
