import { Inject, Injectable, Logger, Optional, Injector, InjectorContext, ResolverContext } from '@dandi/core'
import { HttpRequest, HttpRequestAcceptTypes, HttpResponse } from '@dandi/http'

import { HttpRequestInfo } from './http-request-info'
import { HttpRequestHandler, HttpRequestHandlerMethod } from './http-request-handler'
import { HttpPipelineResult, isHttpPipelineResult } from './http-pipeline-result'
import { HttpPipelineResultTransformer } from './http-pipeline-result-transformer'
import { HttpResponseRenderer, HttpResponseRendererResult } from './http-response-renderer'

@Injectable()
export class HttpPipeline {
  constructor(@Inject(Injector) private injector: Injector, @Inject(Logger) private logger: Logger) {}

  public async handleRequest(
    @Inject(InjectorContext) injectorContext: ResolverContext<any>,
    @Inject(HttpRequestHandler) handler: any,
    @Inject(HttpRequestHandlerMethod) handlerMethod: string,
    @Inject(HttpRequest) req: HttpRequest,
    @Inject(HttpResponse) res: HttpResponse,
    @Inject(HttpRequestAcceptTypes) accept: HttpRequestAcceptTypes,
    @Inject(HttpResponseRenderer) renderer: HttpResponseRenderer,
    @Inject(HttpRequestInfo) requestInfo: HttpRequestInfo,
    @Inject(HttpPipelineResultTransformer)
    @Optional()
      resultTransformers?: HttpPipelineResultTransformer[],
  ): Promise<void> {
    requestInfo.performance.mark('HttpPipeline.handleRequest', 'begin')

    this.logger.debug(
      `begin handleRequest ${handler.constructor.name}.${handlerMethod}:`,
      req.method.toUpperCase(),
      req.path,
    )

    // TODO: consider converting these helper methods into using injector invocations
    //       this would effectively defer injections until they're actually needed
    const handlerResult = await this.invokeHandler(handler, handlerMethod, injectorContext, requestInfo)
    const pipelineResult = await this.transformResult(handlerResult, resultTransformers, res, requestInfo)
    const renderResult = await this.renderResult(renderer, accept, pipelineResult, requestInfo)
    this.sendResponse(res, renderResult, requestInfo)

    this.logger.debug(
      `end handleRequest ${handler.constructor.name}.${handlerMethod}:`,
      req.method.toUpperCase(),
      req.path,
    )

    requestInfo.performance.mark('HttpPipeline.handleRequest', 'end')
  }

  private async invokeHandler(
    handler: any,
    handlerMethod: string,
    injectorContext: ResolverContext<any>,
    requestInfo: HttpRequestInfo,
  ): Promise<any> {
    requestInfo.performance.mark('HttpPipeline.invokeHandler', 'beforeInvokeHandler')
    const result: any = await this.injector.invoke(handler, handlerMethod, injectorContext)
    requestInfo.performance.mark('HttpPipeline.invokeHandler', 'afterInvokeHandler')

    return result
  }

  private async transformResult(
    handlerResult: any,
    resultTransformers: HttpPipelineResultTransformer[],
    res: HttpResponse,
    requestInfo: HttpRequestInfo,
  ): Promise<HttpPipelineResult> {
    requestInfo.performance.mark('HttpPipeline.invokeHandler', 'beforeTransformResult')

    const initialResult: HttpPipelineResult = isHttpPipelineResult(handlerResult) ?
      handlerResult :
      {
        data: handlerResult,
      }
    const pipelineResult = await this.executeTransformers(initialResult, resultTransformers)

    if (pipelineResult.headers) {
      Object.keys(pipelineResult.headers).forEach((key) => {
        res.setHeader(key, pipelineResult.headers[key])
      })
    }

    requestInfo.performance.mark('HttpPipeline.invokeHandler', 'afterTransformResult')
    return pipelineResult
  }

  private async executeTransformers(
    initialResult: HttpPipelineResult,
    resultTransformers: HttpPipelineResultTransformer[],
  ): Promise<HttpPipelineResult> {
    if (!resultTransformers) {
      return initialResult
    }
    return await resultTransformers.reduce(async (resultPromise, transformer) => {
      // TODO: persist headers between transformers
      const result = await resultPromise
      return transformer.transform(result)
    }, Promise.resolve(initialResult))
  }

  private async renderResult(
    renderer: HttpResponseRenderer,
    accept: HttpRequestAcceptTypes,
    pipelineResult: HttpPipelineResult,
    requestInfo: HttpRequestInfo,
  ): Promise<HttpResponseRendererResult> {
    requestInfo.performance.mark('HttpPipeline.renderResult', 'beforeRender')
    const renderResult = await renderer.render(accept, pipelineResult)
    requestInfo.performance.mark('HttpPipeline.renderResult', 'afterRender')
    return renderResult
  }

  private sendResponse(
    res: HttpResponse,
    renderResult: HttpResponseRendererResult,
    requestInfo: HttpRequestInfo,
  ): void {
    requestInfo.performance.mark('HttpPipeline.sendResponse', 'beforeSendResponse')
    res
      .contentType(renderResult.contentType)
      .send(renderResult.renderedOutput)
      .end()
    requestInfo.performance.mark('HttpPipeline.sendResponse', 'afterSendResponse')
  }
}
