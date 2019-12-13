import { Constructor } from '@dandi/common'
import { ModuleBuilder, Registerable } from '@dandi/core'

import { DefaultHttpPipelineErrorHandler } from './default-http-pipeline-error-handler'
import { DefaultHttpRequestInfo } from './default-http-request-info'
import { HttpPipeline } from './http-pipeline'
import { HttpPipelineConfig } from './http-pipeline-config'
import { defaultHttpPipelineRenderer, HttpPipelineRenderer } from './http-pipeline-renderer'
import { HttpResponsePipelineTerminator } from './http-response-pipeline-terminator'
import { PKG } from './local-token'
import { NativeJsonObjectRenderer } from './native-json-object-renderer'
import { PlainTextObjectRenderer } from './plain-text-object-renderer'

export class HttpPipelineModuleBuilder extends ModuleBuilder<HttpPipelineModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(HttpPipelineModuleBuilder, PKG, ...entries)
  }

  public defaultRenderer(rendererType: Constructor<HttpPipelineRenderer>): this {
    return this.add(...defaultHttpPipelineRenderer(rendererType))
  }

  public config(config: Partial<HttpPipelineConfig>): this {
    return this.add({
      provide: HttpPipelineConfig,
      useValue: config,
    })
  }
}

export const HttpPipelineModule = new HttpPipelineModuleBuilder(
  DefaultHttpRequestInfo,
  DefaultHttpPipelineErrorHandler,
  HttpPipeline,
  NativeJsonObjectRenderer,
  PlainTextObjectRenderer,
  HttpResponsePipelineTerminator,
).defaultRenderer(NativeJsonObjectRenderer)
