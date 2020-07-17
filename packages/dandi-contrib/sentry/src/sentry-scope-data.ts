import { Inject, Injectable, InjectionToken, Optional, Provider, RestrictScope, ScopeBehavior } from '@dandi/core'
import { Severity, User } from '@sentry/node'
import { Span } from '@sentry/types'

import { localToken } from './local-token'

export interface SentryScopeData {
  context?: { [key: string]: { [key: string]: any } }
  extras?: { [key: string]: unknown }
  fingerprint?: string[]
  level?: Severity
  span?: Span
  tags?: { [key: string]: string }
  transactionName?: string
  user?: User
}

export const SentryScopeDataFragment: InjectionToken<SentryScopeData> = localToken.opinionated<SentryScopeData>(
  'SentryScopeDataFragment',
  {
    multi: true,
    restrictScope: ScopeBehavior.perInjector,
  },
)

export const SentryScopeData: InjectionToken<SentryScopeData> = localToken.opinionated<SentryScopeData>(
  'SentryScopeData',
  {
    multi: false,
    restrictScope: ScopeBehavior.perInjector,
  },
)

@Injectable(RestrictScope(ScopeBehavior.perInjector))
class SentryScopeDataFragments {
  public static provider: Provider<SentryScopeData> = {
    provide: SentryScopeData,
    useFactory: (fragments: SentryScopeDataFragments) => fragments.compile(),
    deps: [SentryScopeDataFragments],
    providers: [SentryScopeDataFragments],
  }

  constructor(@Optional() @Inject(SentryScopeDataFragment) public readonly fragments: SentryScopeData[]) {}

  private compile(): SentryScopeData {
    if (!this.fragments) {
      return {}
    }
    return this.fragments.reduce((scopeData, fragment) => {
      const { context, extras, fingerprint, level, span, tags, transactionName, user } = fragment
      if (context) {
        scopeData.context = Object.keys(context).reduce((result, key) => {
          result[key] = Object.assign(result[key] || {}, context[key])
          return result
        }, scopeData.context || {})
      }
      if (extras) {
        scopeData.extras = Object.keys(extras).reduce((result, key) => {
          result[key] = Object.assign(result[key] || {}, extras[key])
          return result
        }, scopeData.extras || {})
      }
      if (fingerprint) {
        scopeData.fingerprint = scopeData.fingerprint.concat(fingerprint)
      }
      if (tags) {
        scopeData.tags = Object.keys(tags).reduce((result, key) => {
          result[key] = Object.assign(result[key] || {}, tags[key])
          return result
        }, scopeData.tags || {})
      }
      if (user) {
        scopeData.user = Object.assign(scopeData.user || {}, user)
      }
      if (level) {
        scopeData.level = level
      }
      if (span) {
        scopeData.span = span
      }
      if (transactionName) {
        scopeData.transactionName = transactionName
      }
      return scopeData
    }, {})
  }
}

export const SentryScopeDataProvider: Provider<SentryScopeData> = SentryScopeDataFragments.provider
