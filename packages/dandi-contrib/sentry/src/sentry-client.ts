import { Inject, Injectable } from '@dandi/core'
import { CaptureContext, Event, Severity } from '@sentry/types'

import { SentryConfig } from './sentry-config'
import { SentryOptions } from './sentry-options'
import { SentryScopeData } from './sentry-scope-data'
import { SentryStatic } from './sentry-static'

@Injectable()
export class SentryClient {
  constructor(
    @Inject(SentryConfig) config: SentryOptions,
    @Inject(SentryStatic) private readonly sentry: SentryStatic,
  ) {
    this.sentry.init(config)
  }

  public configureScope(scopeData: SentryScopeData): void {
    this.sentry.configureScope((scope) => {
      const { context, extras, fingerprint, level, span, tags, transactionName, user } = scopeData
      if (context) {
        Object.keys(context).forEach((key) => scope.setContext(key, context[key]))
      }
      if (extras) {
        scope.setExtras(extras)
      }
      if (fingerprint) {
        scope.setFingerprint(fingerprint)
      }
      if (level) {
        scope.setLevel(level)
      }
      if (span) {
        scope.setSpan(span)
      }
      if (tags) {
        scope.setTags(tags)
      }
      if (transactionName) {
        scope.setTransactionName(transactionName)
      }
      if (user) {
        scope.setUser(user)
      }
    })
  }

  public captureException(exception: any, captureContext?: CaptureContext): string {
    return this.sentry.captureException(exception, captureContext)
  }

  public captureMessage(message: string, captureContext?: CaptureContext | Severity): string {
    return this.sentry.captureMessage(message, captureContext)
  }

  public captureEvent(event: Event): string {
    return this.sentry.captureEvent(event)
  }
}
