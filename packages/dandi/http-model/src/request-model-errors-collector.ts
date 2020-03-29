import { Injectable, RestrictScope } from '@dandi/core'
import { HttpRequestScope } from '@dandi/http'
import { ModelErrors } from '@dandi/model-builder'

import { RequestModelErrors } from './request-model-errors-decorator'

/**
 * @internal
 */
@Injectable(RestrictScope(HttpRequestScope))
export class RequestModelErrorsCollector {

  private readonly params = new Map<string, ModelErrors>()
  private body: ModelErrors

  public get hasParamErrors(): boolean {
    return !!this.params.size
  }

  public get hasBodyErrors(): boolean {
    return !!this.body
  }

  public get hasErrors(): boolean {
    return this.hasBodyErrors || this.hasParamErrors
  }

  public addParamsErrors(paramName: string, modelErrors: ModelErrors): void {
    this.params.set(paramName, modelErrors)
  }

  public addBodyErrors(modelErrors: ModelErrors): void {
    this.body = modelErrors
  }

  public compile(): RequestModelErrors {
    if (!this.hasErrors) {
      return undefined
    }
    const result: RequestModelErrors = {}
    if (this.hasBodyErrors) {
      result.body = this.body
    }
    if (this.hasParamErrors) {
      result.params = [...this.params.entries()].reduce((params, [paramName, errors]) => {
        params[paramName] = errors
        return params
      }, {})
    }
    return result
  }

}
