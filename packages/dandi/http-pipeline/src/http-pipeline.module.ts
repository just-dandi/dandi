import { ModuleBuilder, Registerable } from '@dandi/core'

import { DefaultHttpRequestInfo } from './default-http-request-info'
import { DefaultHttpResponseRenderer } from './default-http-response-renderer'
import { HttpPipeline } from './http-pipeline'
import { PKG } from './local-token'
import { NativeJsonObjectRenderer } from './native-json-object-renderer'
import { PlainTextObjectRenderer } from './plain-text-object-renderer'

export class HttpPipelineModuleBuilder extends ModuleBuilder<HttpPipelineModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(HttpPipelineModuleBuilder, PKG, ...entries)
  }
}

export const HttpPipelineModule = new HttpPipelineModuleBuilder(
  DefaultHttpRequestInfo,
  DefaultHttpResponseRenderer.use(NativeJsonObjectRenderer),
  HttpPipeline,
  NativeJsonObjectRenderer,
  PlainTextObjectRenderer,
)
