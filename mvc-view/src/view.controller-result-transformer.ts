import { Inject, Injectable } from '@dandi/core'
import { ControllerResult, ControllerResultTransformer } from '@dandi/mvc'

import { ViewResult } from './view-result'
import { ViewResultFactory } from './view-result-factory'

@Injectable(ControllerResultTransformer)
export class ViewControllerResultTransformer implements ControllerResultTransformer {
  public constructor(@Inject(ViewResultFactory) private viewResult: ViewResultFactory) {}

  public async transform(result: ControllerResult): Promise<ControllerResult> {
    if (result instanceof ViewResult) {
      return result
    }
    return this.viewResult(null, result.resultObject)
  }
}
