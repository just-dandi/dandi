import { OnConfig, Provider } from '@dandi/core'
import { Severity } from '@sentry/types'

import { SentryClient } from './sentry-client'

function sentryOnConfigFactory(client: SentryClient) {
  return () => client.captureMessage('onConfig', Severity.Info)
}

export const SentryOnConfig: Provider<OnConfig> = {
  provide: OnConfig,
  useFactory: sentryOnConfigFactory,
  deps: [SentryClient],
  multi: true,
}
