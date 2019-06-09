import { Inject, Injectable, Logger, Optional, Injector, InjectorContext, ResolverContext } from '@dandi/core'

import { ControllerResult, isControllerResult } from './controller.result'
import { ControllerResultTransformer } from './controller.result.transformer'
import { MvcRequest } from './mvc.request'
import { MvcResponse } from './mvc.response'
import { MvcResponseRenderer } from './mvc-response-renderer'
import { ObjectRenderer } from './object-renderer'
import { RequestAcceptTypes } from './request-accept-types'
import { RequestInfo } from './request.info'
import { Route } from './route'
import { RouteHandler } from './route.handler'
import { RequestController } from './tokens'

@Injectable(RouteHandler)
export class DefaultRouteHandler implements RouteHandler {
  constructor(@Inject(Injector) private injector: Injector, @Inject(Logger) private logger: Logger) {}

  public async handleRouteRequest(
    @Inject(InjectorContext) injectorContext: ResolverContext<any>,
    @Inject(RequestController) controller: any,
    @Inject(Route) route: Route,
    @Inject(MvcRequest) req: MvcRequest,
    @Inject(MvcResponse) res: MvcResponse,
    @Inject(RequestAcceptTypes) accept: RequestAcceptTypes,
    @Inject(MvcResponseRenderer) renderer: ObjectRenderer,
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
    const result: any = await this.injector.invoke(controller, route.controllerMethod as any, injectorContext)
    requestInfo.performance.mark('DefaultRouteHandler.handleRouteRequest', 'afterInvokeController')

    const initialResult: ControllerResult = isControllerResult(result) ?
      result :
      {
        data: result,
      }
    const controllerResult = await this.transformResult(initialResult, resultTransformers)

    if (controllerResult.headers) {
      Object.keys(controllerResult.headers).forEach((key) => {
        res.setHeader(key, controllerResult.headers[key])
      })
    }

    requestInfo.performance.mark('DefaultRouteHandler.handleRouteRequest', 'beforeRender')
    const renderResult = await renderer.render(accept, controllerResult)
    requestInfo.performance.mark('DefaultRouteHandler.handleRouteRequest', 'afterRender')

    requestInfo.performance.mark('DefaultRouteHandler.handleRouteRequest', 'beforeSendResponse')
    res
      .contentType(renderResult.contentType)
      .send(await renderResult.renderedOutput)
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
