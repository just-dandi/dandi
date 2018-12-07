import { Inject } from '@dandi/core'
import { Controller, HttpGet, QueryParam, RequestQueryParamMap } from '@dandi/mvc'
import { View, ViewResultFactory } from '@dandi/mvc-view'

@Controller('view')
export class ViewController {
  constructor(@Inject(ViewResultFactory) private view: ViewResultFactory) {}

  /** static template naming with automatic engine resolution -
   * when the template name will always be the same, only the @View decorator with a name is required,
   * the resolver will find a file with a configured extension (see server.container.ts)
   */
  @HttpGet('auto')
  @View('example-auto')
  public auto(@Inject(RequestQueryParamMap) query) {
    return { query }
  }

  /** static template naming with explicit engine resolution
   * same as above, except the resolver will first look for a configured ViewEngine that is mapped to the specified
   * file name's extension
   */
  @HttpGet('explicit-pug')
  @View('example-explicit.pug')
  public explicitPug(@Inject(RequestQueryParamMap) query) {
    return { query }
  }

  @HttpGet('explicit-ejs')
  @View('example-explicit.ejs')
  public explicitEjs(@Inject(RequestQueryParamMap) query) {
    return { query }
  }

  /** dynamic template naming -
   * when the template name needs to vary, use the @View decorator with no value, and return the result
   * of ViewResultFactory(name, data).
   */
  @HttpGet('dynamic')
  @View()
  public dynamic(@QueryParam(String) mode: string) {
    return this.view(mode === 'b' ? 'dynamic-b' : 'dynamic-a', { data: { mode } })
  }
}
