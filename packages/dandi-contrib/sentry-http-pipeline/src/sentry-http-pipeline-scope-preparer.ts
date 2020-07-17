import { HttpRequest } from '@dandi/http'
import { HttpPipelinePreparer, HttpPipelinePreparerResult } from '@dandi/http-pipeline'
import { SentryScopeData } from '@dandi-contrib/sentry'

function sentryHttpScopeDataFactory(): SentryScopeData {
  return {}
}

@HttpPipelinePreparer()
export class SentryHttpPipelineScopePreparer implements HttpPipelinePreparer {
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
    return [
      {
        provide: SentryScopeData,
        useValue: requestScopeData,
      },
      {
        provide: SentryScopeData,
        useFactory: sentryHttpScopeDataFactory,
        deps: [],
      },
    ]
  }
}
