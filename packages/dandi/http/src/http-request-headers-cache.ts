import { Disposable } from '@dandi/common'
import { Injectable, NotMulti, RestrictScope } from '@dandi/core'

import { HttpRequestHeader } from './http-headers'
import { HttpRequest } from './http-request'
import { HttpRequestScope } from './http-request-scope'

/**
 * Used to provide caching for {@link DandiHttpRequestHeadersAccessor}.
 *
 * {@link HttpRequest} and {@DandiHttpRequestHeadersAccessor} both use {@link ScopeBehavior.perInjector} scoping with
 * the scope restricted to {@link HttpRequestScope}. This allows these injectables to be overridden at any level with
 * a {@link HttpRequestScope}, which in turn enables other services to be used in a recursive manner - for example, when
 * processing parts from a multipart request, or embedding related RESTful resources. This cache allows potentially
 * complicated header parsing to be done once per request object within a given {@link HttpRequestScope}, even when the
 * {@link HttpRequest} object is overridden one or more times.
 */
@Injectable(NotMulti, RestrictScope(HttpRequestScope))
export class HttpRequestHeadersCache implements Disposable {
  private readonly caches = new Map<HttpRequest, Map<HttpRequestHeader, any>>()

  public getRequestCache(req: HttpRequest): Map<HttpRequestHeader, any> {
    if (!this.caches.has(req)) {
      this.caches.set(req, new Map<HttpRequestHeader, any>())
    }
    return this.caches.get(req)
  }

  public dispose(): void {
    this.caches.clear()
  }
}
