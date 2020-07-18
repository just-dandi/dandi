import { HttpRequestHeaders, MimeType } from '@dandi/http'
import { ControllerMethodMetadata } from '@dandi/mvc'

import { RenderOptions } from './render-options'

export type HttpRequestHeaderFunctionComparer<THeaderName extends keyof HttpRequestHeaders> = (
  value: HttpRequestHeaders[THeaderName],
) => boolean

export type HttpRequestHeaderComparer<THeaderName extends keyof HttpRequestHeaders> =
  | HttpRequestHeaderFunctionComparer<THeaderName>
  | HttpRequestHeaders[THeaderName]

export type HttpRequestHeaderComparers = {
  [THeaderName in keyof HttpRequestHeaders]?: HttpRequestHeaders[THeaderName] extends string
    ? // allow regexps for headers with plain string values
      RegExp | HttpRequestHeaderComparer<THeaderName>
    : HttpRequestHeaderComparer<THeaderName>
}

export type ViewFilter = MimeType | HttpRequestHeaderComparers

export interface ViewMetadata {
  name: string
  path?: string
  context: string
  options?: RenderOptions
  filter?: ViewFilter[]
}

export interface ControllerViewMethodMetadata extends ControllerMethodMetadata {
  views?: ViewMetadata[]
}
