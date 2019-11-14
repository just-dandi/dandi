import { HttpPipelineResult } from '@dandi/http-pipeline'

import { ViewEngine } from './view-engine'
import { ViewMetadata } from './view-metadata'

export class ViewResult implements HttpPipelineResult {

  private _value: string | Promise<string>
  public get value(): string | Promise<string> {
    if (!this._value) {
      this._value = this.viewEngine.render(this.view, this.templatePath, this.data)
    }
    return this._value
  }

  constructor(
    private readonly viewEngine: ViewEngine,
    private readonly view: ViewMetadata,
    private readonly templatePath: string,
    public readonly data: any,
  ) {}
}
