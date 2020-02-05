import { MethodTarget } from '@dandi/common'
import { getInjectableParamMetadata, ParamMetadata } from '@dandi/core/internal/util'
import {
  HttpRequestHeader, HttpRequestHeaders,
  requestHeaderProvider,
  requestHeaderToken,
} from '@dandi/http'

export interface RequestHeader<THeaderName extends HttpRequestHeader> extends ParamMetadata<HttpRequestHeaders[THeaderName]> {
  headerName: THeaderName
}

export function requestHeaderDecorator<THeaderName extends HttpRequestHeader>(
  header: RequestHeader<THeaderName>,
  target: MethodTarget<HttpRequestHeaders[THeaderName]>,
  propertyName: string,
  paramIndex: number,
): void {
  const meta = getInjectableParamMetadata<HttpRequestHeaders[THeaderName], RequestHeader<THeaderName>>(target, propertyName, paramIndex)
  meta.token = requestHeaderToken<THeaderName>(header.headerName)
  meta.providers = [requestHeaderProvider(header.headerName)]
}

export function RequestHeader<THeaderName extends HttpRequestHeader, TTarget>(headerName: THeaderName): ParameterDecorator {
  return requestHeaderDecorator.bind(null, { headerName })
}
