import { Inject, Injectable } from '@dandi/core'
import { configureScope, init, Scope, captureException, captureMessage, captureEvent } from '@sentry/node'
import { CaptureContext, Event, Severity } from '@sentry/types'

import { SentryConfig } from './sentry-config'

@Injectable()
export class SentryClient {
  constructor(@Inject(SentryConfig) config: SentryConfig) {
    init(config)
  }

  public configureScope(fn: (scope: Scope) => void): void {
    configureScope(fn)
  }

  public captureException(exception: any, captureContext?: CaptureContext): string {
    return captureException(exception, captureContext)
  }

  public captureMessage(message: string, captureContext?: CaptureContext | Severity): string {
    return captureMessage(message, captureContext)
  }

  public captureEvent(event: Event): string {
    return captureEvent(event)
  }
}
