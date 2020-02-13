import { FactoryProvider, InjectionToken } from '@dandi/core'
import { HttpRequestScope, HttpStatusCode } from '@dandi/http'
import { Route } from '@dandi/mvc'

import { localToken } from './local-token'
import { ViewEngineErrorConfig, ViewEngineMergedErrorConfig } from './view-engine-config'
import { ViewEngineResolver } from './view-engine-resolver'
import { makeViewResult, ViewResult } from './view-result'
import { ViewResultFactoryError } from './view-result-factory.error'
import { ViewRoute } from './view-route'

export type ViewResultFactory = (
  name?: string,
  data?: any,
  errors?: Error[],
  statusCode?: HttpStatusCode,
) => Promise<ViewResult>

export const ViewResultFactory: InjectionToken<ViewResultFactory> = localToken.opinionated<ViewResultFactory>('ViewResultFactory', {
  multi: false,
  restrictScope: HttpRequestScope,
})

function viewResultFactory(
  errorConfig: ViewEngineErrorConfig,
  resolver: ViewEngineResolver,
  route: ViewRoute,
): ViewResultFactory {
  return async (name?: string, data?: any, errors?: Error[], statusCode?: HttpStatusCode): Promise<ViewResult> => {
    statusCode = statusCode || (errors?.length ? HttpStatusCode.internalServerError : HttpStatusCode.ok)
    const [error] = errors || []
    if (error) {
      const errorViewPath = errorConfig.templates[statusCode] || errorConfig.templates.default
      const resolvedView = await resolver.resolve(route.view, errorViewPath)
      return makeViewResult(resolvedView.engine, route.view, resolvedView.templatePath, data)
    }

    if (!route.view) {
      throw new ViewResultFactoryError(
        `The route for '${route.path}' does not have view information. Did you forget the @View() decorator?`,
      )
    }
    const resolvedView = await resolver.resolve(route.view, name)
    return makeViewResult(resolvedView.engine, route.view, resolvedView.templatePath, data)
  }
}

export const VIEW_RESULT_FACTORY: FactoryProvider<ViewResultFactory> = {
  provide: ViewResultFactory,
  useFactory: viewResultFactory,
  deps: [ViewEngineMergedErrorConfig, ViewEngineResolver, Route],
}
