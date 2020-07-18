import { parseBoolean } from '@dandi/common'
import { FactoryProvider, InjectionToken } from '@dandi/core'
import {
  HttpHeader,
  HttpRequestHeadersAccessor,
  HttpRequestScope,
  HttpStatusCode,
  mimeTypesAreCompatible,
  parseMimeTypes,
} from '@dandi/http'
import { Route } from '@dandi/mvc'

import { localToken } from './local-token'
import { ViewEngineErrorConfig, ViewEngineMergedErrorConfig } from './view-engine-config'
import { ViewEngineResolver } from './view-engine-resolver'
import { ViewMetadata, HttpRequestHeaderComparers } from './view-metadata'
import { makeViewResult, ViewResult } from './view-result'
import { ViewResultFactoryError } from './view-result-factory.error'
import { ViewRoute } from './view-route'

export type ViewResultFactory = (
  name?: string,
  data?: any,
  errors?: Error[],
  statusCode?: HttpStatusCode,
) => Promise<ViewResult>

export const ViewResultFactory: InjectionToken<ViewResultFactory> = localToken.opinionated<ViewResultFactory>(
  'ViewResultFactory',
  {
    multi: false,
    restrictScope: HttpRequestScope,
  },
)

function canUseView(view: ViewMetadata, headers: HttpRequestHeadersAccessor): boolean {
  if (!view.filter?.length) {
    return true
  }

  const accept = headers.get(HttpHeader.accept)

  for (const filter of view.filter) {
    if (typeof filter === 'string') {
      const [mimeType] = parseMimeTypes(filter)
      if (mimeTypesAreCompatible(accept, mimeType)) {
        return true
      }
      continue
    }

    const headerEntries = Object.entries(filter) as [
      keyof HttpRequestHeaderComparers,
      RegExp | Function | object | string | number,
    ][]
    const headersMatch = headerEntries.every(([headerName, matcher]) => {
      const headerValue = headers.get(headerName)
      if (matcher instanceof RegExp) {
        return matcher.test(headerValue.toString())
      }
      switch (typeof matcher) {
        case 'function':
          return matcher(headerValue)
        case 'boolean':
          return matcher === parseBoolean(headerValue)
        case 'number':
          return matcher === parseFloat(headerValue.toString())
        case 'string':
          return matcher.toLocaleLowerCase() === headerValue.toString().toLocaleLowerCase()
      }

      // Compare use JSON stringifying as a last-ditch effort - it's faster than recursively checking deep objects, but
      // will return false negatives if the keys are in different orders. If more a specific comparison is desired,
      // a function comparer should be used instead.
      return JSON.stringify(matcher).toLocaleLowerCase() === JSON.stringify(headerValue).toLocaleLowerCase()
    })
    if (headersMatch) {
      return true
    }
  }

  return false
}

function viewResultFactory(
  errorConfig: ViewEngineErrorConfig,
  resolver: ViewEngineResolver,
  route: ViewRoute,
  headers?: HttpRequestHeadersAccessor,
): ViewResultFactory {
  return async (name?: string, data?: any, errors?: Error[], statusCode?: HttpStatusCode): Promise<ViewResult> => {
    statusCode = statusCode || (errors?.length ? HttpStatusCode.internalServerError : undefined)
    const [error] = errors || []
    if (error) {
      const errorViewPath = errorConfig.templates[statusCode] || errorConfig.templates.default
      const resolvedView = await resolver.resolve(undefined, errorViewPath)
      return makeViewResult(resolvedView.engine, undefined, resolvedView.templatePath, data)
    }

    if (!route.views) {
      throw new ViewResultFactoryError(
        `The route for '${route.path}' does not have view information. Did you forget the @View() decorator?`,
      )
    }

    for (const view of route.views) {
      if (canUseView(view, headers)) {
        const resolvedView = await resolver.resolve(view, name)
        return makeViewResult(resolvedView.engine, view, resolvedView.templatePath, data)
      }
    }

    throw new ViewResultFactoryError(
      `The route for '${route.path}' has configured views, but none were eligible to fulfill the request`,
      // TODO: add more info (e.g. available views, request headers
    )
  }
}

export const VIEW_RESULT_FACTORY: FactoryProvider<ViewResultFactory> = {
  provide: ViewResultFactory,
  useFactory: viewResultFactory,
  deps: [ViewEngineMergedErrorConfig, ViewEngineResolver, Route, HttpRequestHeadersAccessor],
}
