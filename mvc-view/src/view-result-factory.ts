import { FactoryProvider, InjectionToken } from '@dandi/core'
import { Route } from '@dandi/mvc'

import { localOpinionatedToken } from './local.token'
import { ViewEngineResolver } from './view-engine-resolver'
import { ViewResult } from './view-result'
import { ViewResultFactoryError } from './view-result-factory.error'
import { ViewRoute } from './view-route'

export type ViewResultFactory = (name?: string, data?: any) => Promise<ViewResult>

export const ViewResultFactory: InjectionToken<ViewResultFactory> = localOpinionatedToken('ViewResultFactory', {
  multi: false,
})

function viewResultFactory(resolver: ViewEngineResolver, route: ViewRoute): ViewResultFactory {
  return async (name?: string, data?: any): Promise<ViewResult> => {
    if (!route.view) {
      throw new ViewResultFactoryError(
        `The route for '${route.path}' does not have view information. Did you forget the @View() decorator?`,
      )
    }
    const resolvedView = await resolver.resolve(route.view, name)
    return new ViewResult(resolvedView.engine, route.view, resolvedView.templatePath, data)
  }
}

export const VIEW_RESULT_FACTORY: FactoryProvider<ViewResultFactory> = {
  provide: ViewResultFactory,
  useFactory: viewResultFactory,
  deps: [ViewEngineResolver, Route],
}
