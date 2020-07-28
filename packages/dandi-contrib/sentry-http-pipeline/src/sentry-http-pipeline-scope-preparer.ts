import { SentryClient, SentryScopeData, SentryScopeDataFragment } from '@dandi-contrib/sentry'
import { Inject } from '@dandi/core'
import { HttpRequest } from '@dandi/http'
import { HttpPipelinePreparer, HttpPipelinePreparerResult, HttpRequestInfo } from '@dandi/http-pipeline'

function sentryHttpPipelineScopeDataFactory(requestInfo: HttpRequestInfo): SentryScopeData {
  return {
    tags: {
      requestId: requestInfo.requestId.toString(),
    },
  }
}

@HttpPipelinePreparer()
export class SentryHttpPipelineScopePreparer implements HttpPipelinePreparer {
  constructor(@Inject(SentryClient) private readonly sentry: SentryClient) {}

  public async prepare(req: HttpRequest): Promise<HttpPipelinePreparerResult> {
    const paramTags = Object.keys(req.params).reduce((result, key) => {
      result[`request.param.${key}`] = req.query[key]
      return result
    }, {})
    const queryTags = Object.keys(req.query).reduce((result, key) => {
      result[`request.query.${key}`] = req.query[key]
      return result
    }, {})
    const requestScopeData: SentryScopeData = {
      tags: Object.assign({}, paramTags, queryTags, {
        'request.method': req.method.toString(),
        'request.path': req.path,
      }),
    }
    this.sentry.configureScope(requestScopeData)
    return [
      {
        provide: SentryScopeDataFragment,
        useFactory: sentryHttpPipelineScopeDataFactory,
        deps: [HttpRequestInfo],
      },
    ]
  }
}
