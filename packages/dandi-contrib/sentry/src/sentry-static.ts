import { IncomingMessage, ServerResponse } from 'http'

import { Provider } from '@dandi/core'
import { Scope } from '@sentry/hub'
import * as Sentry from '@sentry/node'
import { Hub } from '@sentry/node'
import { NodeOptions } from '@sentry/node/dist/backend'
import { CaptureContext, Event, Severity } from '@sentry/types'

import { localToken } from './local-token'

export type TransactionTypes = 'path' | 'methodPath' | 'handler'

export interface ParseRequestOptions {
  ip?: boolean
  request?: boolean | string[]
  serverName?: boolean
  transaction?: boolean | TransactionTypes
  user?: boolean | string[]
  version?: boolean
}

export interface SentryStaticHandlers {
  requestHandler(
    options?: ParseRequestOptions & {
      flushTimeout?: number
    },
  ): (req: IncomingMessage, res: ServerResponse, next: (error?: any) => void) => void
}

export interface SentryStatic {
  Handlers: SentryStaticHandlers

  init(options?: NodeOptions): void
  configureScope(callback: (scope: Scope) => void): void
  captureException(exception: any, captureContext?: CaptureContext): string
  captureMessage(message: string, captureContext?: CaptureContext | Severity): string
  captureEvent(event: Event): string
  getCurrentHub(): Hub
}

export const SentryStatic = localToken.opinionated<SentryStatic>('SentryStatic', {
  multi: false,
})

export const SentryStaticProvider: Provider<SentryStatic> = {
  provide: SentryStatic,
  useValue: Sentry,
}
