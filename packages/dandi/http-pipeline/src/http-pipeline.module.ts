import { Constructor } from '@dandi/common'
import { ModuleBuilder, Registerable } from '@dandi/core'

import { FormMultipartBodyParser } from './body-parsing/form-multipart-body-parser'
import { FormUrlencodedBodyParser } from './body-parsing/form-urlencoded-body-parser'
import { NativeJsonBodyParser } from './body-parsing/native-json-body-parser'
import { PlainTextBodyParser } from './body-parsing/plain-text-body-parser'

import { DefaultHttpPipelineErrorHandler } from './default-http-pipeline-error-handler'
import { DefaultHttpRequestInfo } from './default-http-request-info'
import { HttpPipeline } from './http-pipeline'
import { HttpPipelineConfig } from './http-pipeline-config'
import {
  defaultHttpPipelineRenderer,
  HttpPipelineRenderer,
  HttpPipelineRendererProvider,
} from './rendering/http-pipeline-renderer'
import { HttpRequestBodySourceProvider } from './http-request-body-source-provider'
import { HttpResponsePipelineTerminator } from './http-response-pipeline-terminator'
import { PKG } from './local-token'

import { NativeJsonObjectRenderer } from './rendering/native-json-object-renderer'
import { PlainTextObjectRenderer } from './rendering/plain-text-object-renderer'

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
  FormMultipartBodyParser,
  FormUrlencodedBodyParser,
  HttpPipeline,
  NativeJsonBodyParser,
  NativeJsonObjectRenderer,
  PlainTextObjectRenderer,
  PlainTextBodyParser,
  HttpPipelineRendererProvider,
  HttpRequestBodySourceProvider,
  HttpResponsePipelineTerminator,
).defaultRenderer(NativeJsonObjectRenderer)
