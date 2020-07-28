import { SentryClient, SentryScopeData } from '@dandi-contrib/sentry'
import { Inject, Injectable } from '@dandi/core'
import { BeforeInvokeHandler } from '@dandi/http-pipeline'

@Injectable(BeforeInvokeHandler)
export class SentryOnBeforeInvokeHandler implements BeforeInvokeHandler {
  constructor(@Inject(SentryClient) private readonly sentry: SentryClient) {}

  public onBeforeInvoke(@Inject(SentryScopeData) scopeData: SentryScopeData): void | Promise<void> {
    this.sentry.configureScope(scopeData)
  }
}
