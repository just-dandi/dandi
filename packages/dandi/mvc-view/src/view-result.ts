import { HttpPipelineDataResult, isHttpPipelineDataResult } from '@dandi/http-pipeline'

import { ViewEngine } from './view-engine'
import { ViewMetadata } from './view-metadata'

export interface ViewResult extends HttpPipelineDataResult {
  render(): string | Promise<string>
}

export function isViewResult(obj: any): obj is ViewResult {
  return obj && typeof obj.render === 'function' && isHttpPipelineDataResult(obj)
}

export function makeViewResult(
  viewEngine: ViewEngine,
  view: ViewMetadata,
  templatePath: string,
  data: any,
): ViewResult {
  let value: string | Promise<string>
  return {
    data,
    render(): string | Promise<string> {
      if (!value) {
        value = viewEngine.render(view, templatePath, this.data)
      }
      return value
    },
  }
}
