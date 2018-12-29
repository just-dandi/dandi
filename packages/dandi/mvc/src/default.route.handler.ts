import { Inject, Injectable, Logger, Optional, Resolver, ResolverContext } from '@dandi/core'

import { RequestController } from './tokens'
import { Route } from './route'
import { RouteHandler } from './route.handler'
import { MvcRequest } from './mvc.request'
import { MvcResponse } from './mvc.response'
import { RequestInfo } from './request.info'
import { ControllerResultTransformer } from './controller.result.transformer'
import { ControllerResult, isControllerResult } from './controller.result'
import { JsonControllerResult } from './json.controller.result'

@Injectable(RouteHandler)
export class DefaultRouteHandler implements RouteHandler {
  constructor(@Inject(Resolver) private resolver: Resolver, @Inject(Logger) private logger: Logger) {}

  public async handleRouteRequest(
    @Inject(ResolverContext) resolverContext: ResolverContext<any>,
    @Inject(RequestController) controller: any,
    @Inject(Route) route: Route,
    @Inject(MvcRequest) req: MvcRequest,
    @Inject(MvcResponse) res: MvcResponse,
    @Inject(RequestInfo) requestInfo: RequestInfo,
    @Inject(ControllerResultTransformer)
    @Optional()
    resultTransformers?: ControllerResultTransformer[],
  ): Promise<void> {
    requestInfo.performance.mark('DefaultRouteHandler.handleRouteRequest', 'begin')

    this.logger.debug(
      `begin handleRouteRequest ${route.controllerCtr.name}.${route.controllerMethod.toString()}:`,
      route.httpMethod.toUpperCase(),
      route.path,
    )

    requestInfo.performance.mark('DefaultRouteHandler.handleRouteRequest', 'beforeInvokeController')
    const result = await this.resolver.invokeInContext(resolverContext, controller, controller[route.controllerMethod])
    requestInfo.performance.mark('DefaultRouteHandler.handleRouteRequest', 'afterInvokeController')

    const initialResult: ControllerResult = isControllerResult(result) ? result : new JsonControllerResult(result)
    const controllerResult = await this.transformResult(initialResult, resultTransformers)

    if (controllerResult.headers) {
      Object.keys(controllerResult.headers).forEach((key) => {
        res.setHeader(key, controllerResult.headers[key])
      })
    }

    requestInfo.performance.mark('DefaultRouteHandler.handleRouteRequest', 'beforeSendResponse')
    res
      .contentType(controllerResult.contentType)
      .send(await controllerResult.value)
      .end()
    requestInfo.performance.mark('DefaultRouteHandler.handleRouteRequest', 'afterSendResponse')

    this.logger.debug(
      `end handleRouteRequest ${route.controllerCtr.name}.${route.controllerMethod.toString()}:`,
      route.httpMethod.toUpperCase(),
      route.path,
    )

    requestInfo.performance.mark('DefaultRouteHandler.handleRouteRequest', 'end')
  }

  private async transformResult(
    initialResult: ControllerResult,
    resultTransformers: ControllerResultTransformer[],
  ): Promise<ControllerResult> {
    if (!resultTransformers) {
      return initialResult
    }
    return await resultTransformers.reduce(async (resultPromise, transformer) => {
      // TODO: persist headers between transformers
      const result = await resultPromise
      return transformer.transform(result)
    }, Promise.resolve(initialResult))
  }
}
