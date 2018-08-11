import { Inject, Injectable, Logger, Resolver, ResolverContext } from '@dandi/core';
import {
  ControllerResult,
  isControllerResult,
  JsonControllerResult,
  MvcRequest,
  MvcResponse,
  RequestController,
  RequestInfo,
  Route,
  RouteHandler,
} from '@dandi/mvc';

@Injectable(RouteHandler)
export class ExpressMvcRouteHandler implements RouteHandler {
  constructor(@Inject(Resolver) private resolver: Resolver, @Inject(Logger) private logger: Logger) {}

  public async handleRouteRequest(
    @Inject(ResolverContext) resolverContext: ResolverContext<any>,
    @Inject(RequestController) controller: any,
    @Inject(Route) route: Route,
    @Inject(MvcRequest) req: MvcRequest,
    @Inject(MvcResponse) res: MvcResponse,
    @Inject(RequestInfo) requestInfo: RequestInfo,
  ): Promise<void> {
    requestInfo.performance.mark('ExpressMvcRouteHandler.handleRouteRequest', 'begin');

    this.logger.debug(
      `begin handleRouteRequest ${route.controllerCtr.name}.${route.controllerMethod.toString()}:`,
      route.httpMethod.toUpperCase(),
      route.path,
    );

    requestInfo.performance.mark('ExpressMvcRouteHandler.handleRouteRequest', 'beforeInvokeController');
    const result = await this.resolver.invokeInContext(resolverContext, controller, controller[route.controllerMethod]);
    requestInfo.performance.mark('ExpressMvcRouteHandler.handleRouteRequest', 'afterInvokeController');

    const controllerResult: ControllerResult = isControllerResult(result) ? result : new JsonControllerResult(result);

    if (controllerResult.headers) {
      Object.keys(controllerResult.headers).forEach((key) => {
        res.setHeader(key, controllerResult.headers[key]);
      });
    }

    requestInfo.performance.mark('ExpressMvcRouteHandler.handleRouteRequest', 'beforeSendResponse');
    res
      .contentType(controllerResult.contentType)
      .send(controllerResult.value)
      .end();
    requestInfo.performance.mark('ExpressMvcRouteHandler.handleRouteRequest', 'afterSendResponse');

    this.logger.debug(
      `end handleRouteRequest ${route.controllerCtr.name}.${route.controllerMethod.toString()}:`,
      route.httpMethod.toUpperCase(),
      route.path,
    );

    requestInfo.performance.mark('ExpressMvcRouteHandler.handleRouteRequest', 'end');
  }
}
