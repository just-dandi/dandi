import { Inject } from '@dandi/core'
import { HttpRequest, HttpRequestQueryParamMap, ParamMap, HttpHeader } from '@dandi/http'
import { QueryParam } from '@dandi/http-model'
import { Controller, HttpGet } from '@dandi/mvc'
import { View, ViewResult, ViewResultFactory } from '@dandi/mvc-view'
import { RequestHeader } from '@dandi/http-model/src/request-header.decorator'

@Controller('view')
export class ViewController {
  constructor(@Inject(ViewResultFactory) private view: ViewResultFactory) {}

  /** static template naming with automatic engine resolution -
   * when the template name will always be the same, only the @View decorator with a name is required,
   * the resolver will find a file with a configured extension (see server.container.ts)
   */
  @HttpGet('auto')
  @View('example-auto')
  public auto(@Inject(HttpRequestQueryParamMap) query): { query: ParamMap } {
    return { query }
  }

  /** static template naming with explicit engine resolution
   * same as above, except the resolver will first look for a configured ViewEngine that is mapped to the specified
   * file name's extension
   */
  @HttpGet('explicit-pug')
  @View('example-explicit.pug')
  public explicitPug(@Inject(HttpRequestQueryParamMap) query): { query: ParamMap } {
    return { query }
  }

  @HttpGet('explicit-ejs')
  @View('example-explicit.ejs')
  public explicitEjs(@Inject(HttpRequestQueryParamMap) query): { query: ParamMap } {
    return { query }
  }

  /** dynamic template naming -
   * when the template name needs to vary, use the @View decorator with no value, and return the result
   * of ViewResultFactory(name, data).
   */
  @HttpGet('dynamic')
  @View()
  public dynamic(@QueryParam(String) mode: string): Promise<ViewResult> {
    return this.view(mode === 'b' ? 'dynamic-b' : 'dynamic-a', { data: { mode } })
  }

  /** helper route for testing CORS
   *
   */
  @HttpGet('cors')
  @View('cors.pug')
  public cors(
    @QueryParam(String) restApiHost: string,
    @QueryParam(String) awsHost: string,
    @RequestHeader(HttpHeader.host) host: string,
    @Inject(HttpRequest) req: HttpRequest,
  ): { restApiHost: string, restApiPort: string, awsHost: string, search: string, appendSearch: string } {
    const [, restApiPort] = host.split(':')
    const search = [...Object.entries(req.query)].reduce((result, [key, value]) => {
      if (result) {
        result += '&'
      }
      result += `${key}=${value.toString()}`
      return result
    }, '')
    const appendSearch = search ? '&' : ''
    return { restApiHost, restApiPort, awsHost, search, appendSearch }
  }
}
