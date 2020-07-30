import { SentryClient, SentryScopeData, SentryScopeDataFragment } from '@dandi-contrib/sentry'
import { Inject, Injectable, RestrictScope, ScopeBehavior, Optional, Provider } from '@dandi/core'
import { HttpRequestScope } from '@dandi/http'
import { HttpPipelinePreparer, HttpPipelinePreparerResult } from '@dandi/http-pipeline'
import { AuthorizedUser, Route } from '@dandi/mvc'

@Injectable(RestrictScope(ScopeBehavior.perInjector(HttpRequestScope)))
class SentryMvcScopeDataService {
  public static factory(scopeData: SentryMvcScopeDataService): SentryScopeData {
    return scopeData.getData()
  }

  public static readonly provider: Provider<SentryScopeData> = {
    provide: SentryScopeDataFragment,
    useFactory: SentryMvcScopeDataService.factory,
    deps: [SentryMvcScopeDataService],
    providers: [SentryMvcScopeDataService],
  }

  constructor(
    @Inject(Route) private readonly route: Route,
    @Optional() @Inject(AuthorizedUser) private readonly authUser: AuthorizedUser,
  ) {}

  public getData(): SentryScopeData {
    return {
      tags: {
        'route.method': this.route.httpMethod,
        'route.path': this.route.path,
        'route.controller': this.route.controllerCtr.name,
        'route.controllerMethod': this.route.controllerMethod.toString(),
        'route.hasCors': this.route.cors ? 'yes' : 'no',
        'route.requiresAuth': this.route.authorization ? 'yes' : 'no',
      },
      user: this.authUser
        ? {
            id: this.authUser.uid,
          }
        : undefined,
    }
  }
}

@HttpPipelinePreparer()
export class SentryMvcScopePreparer implements HttpPipelinePreparer {
  constructor(@Inject(SentryClient) private readonly sentry: SentryClient) {}

  public async prepare(): Promise<HttpPipelinePreparerResult> {
    return [SentryMvcScopeDataService.provider]
  }
}
