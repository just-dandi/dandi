import { SentryClient } from '@dandi-contrib/sentry'
import { Inject, Injectable } from '@dandi/core'
import { HttpPipelineErrorResult, HttpPipelineErrorResultHandler } from '@dandi/http-pipeline'

@Injectable(HttpPipelineErrorResultHandler)
export class SentryErrorHandler implements HttpPipelineErrorResultHandler {
  constructor(@Inject(SentryClient) private readonly sentry: SentryClient) {}

  public async handleError(result: HttpPipelineErrorResult): Promise<HttpPipelineErrorResult> {
    this.sentry.captureException(result.errors[0])
    return result
  }
}
