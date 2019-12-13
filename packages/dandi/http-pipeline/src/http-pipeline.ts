import {
  Inject,
  Injectable,
  InjectionToken,
  Injector,
  InjectorContext,
  InstanceInvokableFn,
  Logger,
  Optional,
  Provider,
  ResolverContext,
} from '@dandi/core'
import { HttpRequest, HttpRequestAcceptTypes, HttpStatusCode, MimeTypes } from '@dandi/http'

import { HttpPipelineConfig } from './http-pipeline-config'
import { HttpPipelineErrorResult } from './http-pipeline-error-result'
import { HttpPipelineErrorResultHandler } from './http-pipeline-error-result-handler'
import { HttpPipelineHandlerResult } from './http-pipeline-handler-result'
import { HttpPipelineRenderer, HttpPipelineRendererResult } from './http-pipeline-renderer'
import { HttpPipelineResult, isHttpPipelineResult } from './http-pipeline-result'
import { HttpPipelineResultTransformer } from './http-pipeline-result-transformer'
import { HttpPipelineTerminator } from './http-pipeline-terminator'
import { HttpRequestHandler, HttpRequestHandlerMethod } from './http-request-handler'
import { HttpRequestInfo } from './http-request-info'
import { HttpRequestPreparerResult, httpRequestPreparerResultProvider } from './http-request-preparer'

@Injectable()
export class HttpPipeline {
  constructor(
    @Inject(Injector) private injector: Injector,
    @Inject(Logger) private logger: Logger,
  ) {}

  public async handleRequest(
    @Inject(InjectorContext) injectorContext: ResolverContext<any>,
    @Inject(HttpRequestHandler) handler: any,
    @Inject(HttpRequestHandlerMethod) handlerMethod: string,
    @Inject(HttpRequest) req: HttpRequest,
    @Inject(HttpRequestInfo) requestInfo: HttpRequestInfo,
    @Inject(HttpPipelineErrorResultHandler) errorHandlers: HttpPipelineErrorResultHandler[],
  ): Promise<any> {
    requestInfo.performance.mark('HttpPipeline.handleRequest', 'begin')

    this.logger.debug(
      `begin handleRequest ${handler.constructor.name}.${handlerMethod}:`,
      req.method.toUpperCase(),
      req.path,
    )

    const preparedProviders = await this.invokeStep(injectorContext, this.prepare, requestInfo)

    preparedProviders.push(
      await this.safeInvokeStepAsProvider(injectorContext, this.invokeHandler, requestInfo, preparedProviders, errorHandlers, HttpPipelineHandlerResult),
    )
    preparedProviders.push(
      await this.safeInvokeStepAsProvider(injectorContext, this.transformResult, requestInfo, preparedProviders, errorHandlers, HttpPipelineResult),
    )
    preparedProviders.push(
      await this.safeInvokeStepAsProvider(injectorContext, this.renderResult, requestInfo, preparedProviders, errorHandlers, HttpPipelineRendererResult),
    )

    const terminatorResult = await this.safeInvokeStep(injectorContext, this.terminateResponse, requestInfo, preparedProviders, errorHandlers)

    this.logger.debug(
      `end handleRequest ${handler.constructor.name}.${handlerMethod}:`,
      req.method.toUpperCase(),
      req.path,
    )

    requestInfo.performance.mark('HttpPipeline.handleRequest', 'end')

    return terminatorResult
  }

  private async invokeStep<TResult>(
    injectorContext: ResolverContext<any>,
    step: (...args: any[]) => TResult,
    requestInfo: HttpRequestInfo,
    providers: Provider<any>[] = [],
  ): Promise<TResult> {
    requestInfo.performance.mark('HttpPipeline.step', `before ${step}`)
    const stepMethodName = step.name as InstanceInvokableFn<this, Promise<TResult>>
    const result = await this.injector.invoke(this, stepMethodName, injectorContext, ...providers)
    requestInfo.performance.mark('HttpPipeline.step', `after ${step}`)
    return result
  }

  private async safeInvokeStep<TResult>(
    injectorContext: ResolverContext<any>,
    step: (...args: any[]) => TResult,
    requestInfo: HttpRequestInfo,
    providers: Provider<any>[],
    errorHandlers: HttpPipelineErrorResultHandler[],
  ): Promise<TResult | HttpPipelineErrorResult> {
    try {
      return await this.invokeStep(injectorContext, step, requestInfo, providers)
    } catch (err) {
      return this.handleError({ errors: [err] }, errorHandlers, requestInfo)
    }
  }

  private async safeInvokeStepAsProvider<TResult>(
    injectorContext: ResolverContext<any>,
    step: (...args: any[]) => TResult,
    requestInfo: HttpRequestInfo,
    providers: Provider<any>[] = [],
    errorHandlers: HttpPipelineErrorResultHandler[],
    provide: InjectionToken<any>,
  ): Promise<Provider<any>> {
    const result = await this.safeInvokeStep(injectorContext, step, requestInfo, providers, errorHandlers)
    return {
      provide,
      useValue: result,
    }
  }

  public async prepare(@Inject(HttpPipelineConfig) @Optional() config: HttpPipelineConfig): Promise<Provider<any>[]> {
    if (!config?.before) {
      return []
    }
    const providers: Provider<any>[] = []
    for (const preparer of config.before) {
      const token = HttpRequestPreparerResult(preparer)
      const provider = httpRequestPreparerResultProvider(preparer)
      const preparerResult = (await this.injector.inject(token, provider, ...providers)).singleValue
      providers.push(...preparerResult)
    }
    return providers
  }

  private async invokeHandler(
    @Inject(HttpRequestHandler) handler: any,
    @Inject(HttpRequestHandlerMethod) handlerMethod: string,
    @Inject(InjectorContext) injectorContext: ResolverContext<any>,
  ): Promise<Provider<any>> {
    return await this.injector.invoke(handler, handlerMethod, injectorContext)
  }

  private async transformResult(
    @Inject(HttpPipelineHandlerResult) handlerResult: any,
    @Inject(HttpPipelineResultTransformer) @Optional() transformers: HttpPipelineResultTransformer[],
  ): Promise<HttpPipelineResult> {
    const initialResult: HttpPipelineResult = isHttpPipelineResult(handlerResult) ?
      handlerResult :
      {
        data: handlerResult,
      }

    if (transformers?.length) {
      return await this.executeTransformers(initialResult, transformers)
    }

    return initialResult
  }

  private async handleError(
    result: HttpPipelineErrorResult,
    errorHandlers: HttpPipelineErrorResultHandler[],
    requestInfo: HttpRequestInfo,
  ): Promise<HttpPipelineErrorResult> {
    requestInfo.performance.mark('HttpPipeline.invokeHandler', 'beforeHandleErrors')

    const pipelineResult = await this.executeErrorHandlers(result, errorHandlers)

    requestInfo.performance.mark('HttpPipeline.invokeHandler', 'afterHandleErrors')
    return pipelineResult
  }

  private async executeTransformers(
    result: HttpPipelineResult,
    resultTransformers: HttpPipelineResultTransformer[],
  ): Promise<HttpPipelineResult> {
    for (const transformer of resultTransformers) {
      // IMPORTANT: while this is already executed in a try/catch, each transformer MUST be allowed to run to ensure
      //            things like CORS are allowed to run regardless of whether other transformers fail
      try {
        result = await transformer.transform(result)
      } catch (err) {
        if (result.errors) {
          result.errors.push(err)
        } else {
          result = Object.assign({
            errors: [err],
          }, result)
        }
      }
    }
    return result
  }

  private async executeErrorHandlers(
    result: HttpPipelineErrorResult,
    errorHandlers: HttpPipelineErrorResultHandler[],
  ): Promise<HttpPipelineErrorResult> {
    for (const errorHandler of errorHandlers) {
      result = await errorHandler.handleError(result)
    }
    return result
  }

  private async renderResult(
    @Inject(HttpPipelineRenderer) renderer: HttpPipelineRenderer,
    @Inject(HttpRequestAcceptTypes) accept: HttpRequestAcceptTypes,
    @Inject(HttpPipelineResult) pipelineResult: HttpPipelineResult,
  ): Promise<HttpPipelineRendererResult> {
    try {
      return await renderer.render(accept, pipelineResult)
    } catch (err) {
      this.logger.error(err)
      return {
        statusCode: pipelineResult.statusCode || HttpStatusCode.internalServerError,
        contentType: MimeTypes.textPlain,
        headers: pipelineResult.headers,
        renderedBody: err.message,
      }
    }
  }

  private async terminateResponse(
    @Inject(HttpPipelineTerminator) terminator: HttpPipelineTerminator,
    @Inject(HttpPipelineRendererResult) renderResult: HttpPipelineRendererResult,
  ): Promise<void> {
    return await terminator.terminateResponse(renderResult)
  }
}
