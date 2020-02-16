import { Inject, Injectable, Optional } from '@dandi/core'
import { ConfiguredViewEngine, ViewEngine, ViewEngineErrorConfig, ViewMetadata } from '@dandi/mvc-view'
import * as pug from 'pug'

import { PUG_DEFAULT_ERROR_CONFIG } from './pug-default-error-config'
import { PUG_DEFAULT_OPTIONS } from './pug-default-options'
import { PugOptions } from './pug-options'

@Injectable(ViewEngine)
export class PugViewEngine implements ViewEngine {
  public static config(options: PugOptions): ConfiguredViewEngine {
    return [
      PugViewEngine,
      {
        provide: ViewEngineErrorConfig,
        useValue: PUG_DEFAULT_ERROR_CONFIG,
      },
      {
        provide: PugOptions,
        useValue: Object.assign({}, PUG_DEFAULT_OPTIONS, options),
      },
    ]
  }

  constructor(@Inject(PugOptions) @Optional() private readonly defaultOptions: PugOptions) {
    if (!defaultOptions) {
      this.defaultOptions = PUG_DEFAULT_OPTIONS
    }
  }

  public async render(view: ViewMetadata, templatePath: string, data?: any): Promise<string> {
    const options = Object.assign({}, this.defaultOptions, { basedir: view.context }, data)
    return pug.renderFile(templatePath, options)
  }
}
