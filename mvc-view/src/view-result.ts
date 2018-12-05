import { ControllerResult } from '@dandi/mvc';

import { ViewEngine } from './view-engine';
import { ViewMetadata } from './view-metadata';

const CONTENT_TYPE = 'text/html';

export class ViewResult implements ControllerResult {

  public readonly contentType: string = CONTENT_TYPE;

  private _value: string | Promise<string>;
  public get value(): string | Promise<string> {
    if (!this._value) {
      this._value = this.viewEngine.render(this.view, this.resultObject);
    }
    return this._value;
  }

  constructor(
    private readonly viewEngine: ViewEngine,
    private readonly view: ViewMetadata,
    public readonly resultObject: any,
  ) {}

}
