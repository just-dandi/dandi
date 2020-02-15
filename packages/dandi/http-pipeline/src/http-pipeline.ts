import {
  Inject,
  Injectable,
  InjectionToken,
  Injector,
  InstanceInvokableFn,
  Logger,
  LogLevel,
  Optional,
  Provider,
} from '@dandi/core'
import { HttpRequest, HttpRequestAcceptTypes, HttpStatusCode, MimeType } from '@dandi/http'

import { CorsAllowRequest } from './cors/cors-allow-request'
import { HttpPipelineConfig } from './http-pipeline-config'
import { HttpPipelineErrorResult } from './http-pipeline-error-result'
import { HttpPipelineErrorResultHandler } from './http-pipeline-error-result-handler'
import { HttpPipelineHandlerResult } from './http-pipeline-handler-result'
import { HttpPipelineRenderer, HttpPipelineRendererResult } from './rendering/http-pipeline-renderer'
import { HttpPipelineResult, HttpPipelineVoidResult, isHttpPipelineResult } from './http-pipeline-result'
import { HttpPipelineResultTransformer } from './http-pipeline-result-transformer'
import { HttpPipelineTerminator } from './http-pipeline-terminator'
import { HttpRequestHandler, HttpRequestHandlerMethod } from './http-request-handler'
import { HttpRequestInfo } from './http-request-info'
import { HttpPipelinePreparerResult, httpPipelinePreparerResultProvider } from './http-pipeline-preparer'

@Injectable()
export class HttpPipeline {
  constructor(
    @Inject(Logger) private logger: Logger,
    @Inject(HttpPipelineConfig) private config: HttpPipelineConfig,
  ) {}

  public async handleRequest(
    @Inject(Injector) injector: Injector,
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

    const preparedProviders = await this.invokeStep(injector, this.prepare, requestInfo)

    const allowRequest = await this.invokeStep(injector, this.checkCors, requestInfo, preparedProviders)

    if (allowRequest === true) {
      preparedProviders.push(
        await this.safeInvokeStepAsProvider(injector, req, this.invokeHandler, requestInfo, preparedProviders, errorHandlers, HttpPipelineHandlerResult),
      )
    } else {
      preparedProviders.push({
        provide: HttpPipelineResult,
        useValue: allowRequest,
      })
    }

    preparedProviders.push(
      await this.safeInvokeStepAsProvider(injector, req, this.transformResult, requestInfo, preparedProviders, errorHandlers, HttpPipelineResult),
    )
    preparedProviders.push(
      await this.safeInvokeStepAsProvider(injector, req, this.renderResult, requestInfo, preparedProviders, errorHandlers, HttpPipelineRendererResult),
    )

    const terminatorResult = await this.invokeStep(injector, this.terminateResponse, requestInfo, preparedProviders)

    this.logger.debug(
      `end handleRequest ${handler.constructor.name}.${handlerMethod}:`,
      req.method.toUpperCase(),
      req.path,
    )

    requestInfo.performance.mark('HttpPipeline.handleRequest', 'end')

    return terminatorResult
  }

  private async invokeStep<TResult>(
    injector: Injector,
    step: (...args: any[]) => TResult,
    requestInfo: HttpRequestInfo,
    providers: Provider<any>[] = [],
  ): Promise<TResult> {
    requestInfo.performance.mark('HttpPipeline.step', `before ${step.name}`)
    const stepMethodName = step.name as InstanceInvokableFn<this, Promise<TResult>>
    const result = await injector.invoke(this, stepMethodName, ...providers)
    requestInfo.performance.mark('HttpPipeline.step', `after ${step.name}`)
    return result
  }

  private async safeInvokeStep<TResult>(
    injector: Injector,
    req: HttpRequest,
    step: (...args: any[]) => TResult,
    requestInfo: HttpRequestInfo,
    providers: Provider<any>[],
    errorHandlers: HttpPipelineErrorResultHandler[],
  ): Promise<TResult | HttpPipelineErrorResult> {
    try {
      return await this.invokeStep(injector, step, requestInfo, providers)
    } catch (err) {
      return this.handleError(req, { errors: [err] }, errorHandlers, requestInfo)
    }
  }

  private async safeInvokeStepAsProvider<TResult>(
    injector: Injector,
    req: HttpRequest,
    step: (...args: any[]) => TResult,
    requestInfo: HttpRequestInfo,
    providers: Provider<any>[] = [],
    errorHandlers: HttpPipelineErrorResultHandler[],
    provide: InjectionToken<any>,
  ): Promise<Provider<any>> {
    const result = await this.safeInvokeStep(injector, req, step, requestInfo, providers, errorHandlers)
    return {
      provide,
      useValue: result,
    }
  }

  public async prepare(
    @Inject(Injector) injector: Injector,
  ): Promise<Provider<any>[]> {
    if (!this.config.before) {
      return []
    }
    const providers: Provider<any>[] = []
    for (const preparer of this.config.before) {
      const token = HttpPipelinePreparerResult(preparer)
      const provider = httpPipelinePreparerResultProvider(preparer)
      const preparerInjector = injector.createChild(preparer, [provider].concat(providers))
      const preparerResult = (await preparerInjector.inject(token)).singleValue
      providers.push(...preparerResult)
    }
    return providers
  }

  private checkCors(
    @Inject(CorsAllowRequest) allowRequest: boolean,
  ): true | HttpPipelineVoidResult {
    if (allowRequest) {
      return true
    }
    return {
      void: true,
    }
  }

  private async invokeHandler(
    @Inject(Injector) injector: Injector,
    @Inject(HttpRequestHandler) handler: any,
    @Inject(HttpRequestHandlerMethod) handlerMethod: string,
  ): Promise<any> {
    const result = await injector.invoke(handler, handlerMethod)
    if (result === undefined) {
      return {}
    }
    return result
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
    req: HttpRequest,
    result: HttpPipelineErrorResult,
    errorHandlers: HttpPipelineErrorResultHandler[],
    requestInfo: HttpRequestInfo,
  ): Promise<HttpPipelineErrorResult> {
    requestInfo.performance.mark('HttpPipeline.invokeHandler', 'beforeHandleErrors')

    const [err] = result.errors

    if (this.config.logHandledErrors) {
      const logLevel = this.config.logHandledErrors === true ? LogLevel.error : this.config.logHandledErrors
      this.logger[logLevel](`Error handling request ${req.method} ${req.path} requestId ${requestInfo.requestId}`, err.stack)
    }
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
        contentType: MimeType.textPlain,
        headers: pipelineResult.headers,
        renderedBody: err.stack,
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
