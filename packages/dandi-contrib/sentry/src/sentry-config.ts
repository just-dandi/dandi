import { Provider } from '@dandi/core'

import { localToken } from './local-token'
import { SentryCredentials } from './sentry-credentials'
import { SentryOptions } from './sentry-options'

export const SentryConfig = localToken.opinionated<SentryOptions>('SentryOptions', {
  multi: false,
})

function sentryConfigFactory(options: SentryOptions[], credentials: SentryCredentials): SentryOptions {
  return Object.assign(
    options.reduce((result, option) => Object.assign(result, option), {}),
    credentials,
  )
}

export const SentryConfigProvider: Provider<SentryOptions> = {
  provide: SentryConfig,
  useFactory: sentryConfigFactory,
  deps: [SentryOptions, SentryCredentials],
}
