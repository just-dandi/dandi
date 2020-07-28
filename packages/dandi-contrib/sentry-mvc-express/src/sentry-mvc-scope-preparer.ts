import { SentryClient, SentryScopeData, SentryScopeDataFragment } from '@dandi-contrib/sentry'
import { Inject } from '@dandi/core'
import { HttpPipelinePreparer, HttpPipelinePreparerResult } from '@dandi/http-pipeline'
import { AuthorizedUser, Route } from '@dandi/mvc'

async function sentryMvcScopeDataFactory(user: AuthorizedUser, route: Route): Promise<SentryScopeData> {
  return {
    tags: {
      'route.method': route.httpMethod,
      'route.path': route.path,
      'route.controller': route.controllerCtr.name,
      'route.controllerMethod': route.controllerMethod.toString(),
      'route.hasCors': route.cors ? 'yes' : 'no',
      'route.requiresAuth': route.authorization ? 'yes' : 'no',
    },
    user: user
      ? {
          id: user.uid,
        }
      : undefined,
  }
}

@HttpPipelinePreparer()
export class SentryMvcScopePreparer implements HttpPipelinePreparer {
  constructor(@Inject(SentryClient) private readonly sentry: SentryClient) {}

  public async prepare(): Promise<HttpPipelinePreparerResult> {
    return [
      {
        provide: SentryScopeDataFragment,
        useFactory: sentryMvcScopeDataFactory,
        deps: [AuthorizedUser, Route],
        async: true,
      },
    ]
  }
}
