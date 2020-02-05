import { Constructor } from '@dandi/common'
import { ModuleBuilder, Registerable } from '@dandi/core'

import { BodyParserInfoProvider } from './body-parsing/body-parser-decorator'
import { FormMultipartBodyParser } from './body-parsing/form-multipart-body-parser'
import { FormUrlencodedBodyParser } from './body-parsing/form-urlencoded-body-parser'
import { HttpBodyParserProvider, HttpBodyParserCacheProvider } from './body-parsing/http-body-parser'
import { NativeJsonBodyParser } from './body-parsing/native-json-body-parser'
import { PlainTextBodyParser } from './body-parsing/plain-text-body-parser'

import { CorsAllowHeaders, CorsAllowCredentials, CorsOrigin, CorsMaxAge, CorsExposeHeaders } from './cors/cors'
import { CorsConfig } from './cors/cors-config'
import { CorsHeaderValues } from './cors/cors-headers'
import { CorsHandler } from './cors/cors-handler'
import { CorsOriginWhitelist } from './cors/cors-origin-whitelist'
import { CorsOriginWhitelistProvider } from './cors/cors-origin-whitelist-provider'
import { CorsPreparer } from './cors/cors-preparer'
import { CorsTransformer } from './cors/cors-transformer'

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

export const DEFAULT_CONFIG: HttpPipelineConfig = {
  before: [
    CorsPreparer,
  ],
}

export class HttpPipelineModuleBuilder extends ModuleBuilder<HttpPipelineModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(HttpPipelineModuleBuilder, PKG, ...entries)
  }

  public defaultRenderer(rendererType: Constructor<HttpPipelineRenderer>): this {
    return this.add(...defaultHttpPipelineRenderer(rendererType))
  }

  public config(config: Partial<HttpPipelineConfig>): this {
    if (DEFAULT_CONFIG.before) {
      if (!config.before) {
        config.before = []
      }
      config.before.push(...DEFAULT_CONFIG.before)
    }
    if (DEFAULT_CONFIG.after) {
      if (!config.after) {
        config.after = []
      }
      config.after.push(...DEFAULT_CONFIG.after)
    }
    return this.add({
      provide: HttpPipelineConfig,
      useValue: config,
    })
  }

  public cors(config: Partial<CorsConfig>): this {
    if (config.allowCredentials) {
      this.add({
        provide: CorsAllowCredentials,
        useValue: true,
      })
    }
    if (config.allowHeaders) {
      this.add({
        provide: CorsAllowHeaders,
        useValue: config.allowHeaders,
      })
    }
    if (config.allowOrigin) {
      if (typeof config.allowOrigin === 'function') {
        this.add({
          provide: CorsOrigin,
          useFactory: config.allowOrigin,
        })
      } else {
        this.add({
          provide: CorsOriginWhitelist,
          useValue: config.allowOrigin,
        }, CorsOriginWhitelistProvider)
      }
    }
    if (typeof config.maxAge !== 'undefined') {
      this.add({
        provide: CorsMaxAge,
        useValue: config.maxAge,
      })
    }
    if (config.exposeHeaders) {
      this.add({
        provide: CorsExposeHeaders,
        useValue: config.exposeHeaders,
      })
    }

    return this
  }
}

export const HttpPipelineModule = new HttpPipelineModuleBuilder(
  CorsHandler,
  CorsHeaderValues,
  CorsPreparer,
  CorsTransformer,
  DefaultHttpRequestInfo,
  DefaultHttpPipelineErrorHandler,
  FormMultipartBodyParser,
  FormUrlencodedBodyParser,
  HttpBodyParserProvider,
  HttpPipeline,
  HttpPipelineRendererProvider,
  HttpRequestBodySourceProvider,
  HttpResponsePipelineTerminator,
  NativeJsonBodyParser,
  NativeJsonObjectRenderer,
  PlainTextObjectRenderer,
  PlainTextBodyParser,

  BodyParserInfoProvider,
  HttpBodyParserCacheProvider,

  {
    provide: HttpPipelineConfig,
    useValue: DEFAULT_CONFIG,
  },
).defaultRenderer(NativeJsonObjectRenderer)
