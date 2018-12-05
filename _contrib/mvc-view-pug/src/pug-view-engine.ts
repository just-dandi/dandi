import { Inject, Injectable, Optional } from '@dandi/core';
import { ViewEngine, ViewMetadata } from '@dandi/mvc-view';

import * as pug from 'pug';

import { PUG_DEFAULT_OPTIONS } from './pug-default-options';
import { PugOptions } from './pug-options';

const EXTENSION = 'pug';

@Injectable(ViewEngine(EXTENSION))
export class PugViewEngine implements ViewEngine {
  constructor(@Inject(PugOptions) @Optional() private readonly defaultOptions: PugOptions) {
    if (!defaultOptions) {
      this.defaultOptions = PUG_DEFAULT_OPTIONS;
    }
  }

  public async render(view: ViewMetadata, data?: any): Promise<string> {
    const options = Object.assign({}, this.defaultOptions, { basedir: view.context }, data);
    return pug.renderFile(view.path, options);
  }
}
