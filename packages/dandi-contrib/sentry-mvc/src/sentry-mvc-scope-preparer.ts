import { HttpRequest } from '@dandi/http'
import { HttpPipelinePreparer, HttpPipelinePreparerResult } from '@dandi/http-pipeline'
import { AuthorizedUser } from '@dandi/mvc'
import { SentryScopeData } from '@dandi-contrib/sentry'

async function sentryMvcScopeDataFactory(user: AuthorizedUser): Promise<SentryScopeData> {
  return {
    user: {
      id: user?.uid,
    },
  }
}

@HttpPipelinePreparer()
export class SentryMvcScopePreparer implements HttpPipelinePreparer {
  public async prepare(req: HttpRequest): Promise<HttpPipelinePreparerResult> {
    return [
      {
        provide: SentryScopeData,
        useFactory: sentryMvcScopeDataFactory,
        deps: [AuthorizedUser],
      },
    ]
  }
}
