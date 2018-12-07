import { JsonControllerResult } from '@dandi/mvc'

export const HAL_CONTENT_TYPE = 'application/hal+json'

export class HalControllerResult extends JsonControllerResult {
  constructor(resultObject: any, headers?: { [headerName: string]: string }) {
    super(resultObject, headers)
  }

  public get contentType(): string {
    return HAL_CONTENT_TYPE
  }
}
