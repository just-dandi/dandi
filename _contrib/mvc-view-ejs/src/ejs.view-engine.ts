import { Inject, Injectable, Optional } from '@dandi/core'
import { ConfiguredViewEngine, ViewEngine, ViewMetadata } from '@dandi/mvc-view'
import * as ejs from 'ejs'

import { EjsOptions } from './ejs-options'
import { EJS_DEFAULT_OPTIONS } from './ejs-default-options'

@Injectable(ViewEngine)
export class EjsViewEngine implements ViewEngine {
  public static config(options: EjsOptions): ConfiguredViewEngine {
    return [
      EjsViewEngine,
      {
        provide: EjsOptions,
        useValue: Object.assign({}, EJS_DEFAULT_OPTIONS, options),
      },
    ]
  }

  constructor(@Inject(EjsOptions) @Optional() private readonly defaultOptions: EjsOptions) {
    if (!defaultOptions) {
      this.defaultOptions = EJS_DEFAULT_OPTIONS
    }
  }

  public async render(view: ViewMetadata, templatePath: string, data?: any): Promise<string> {
    const options = Object.assign({}, this.defaultOptions, { context: view.context, filename: templatePath })
    return new Promise((resolve, reject) => {
      ejs.renderFile(templatePath, data, options, (err, result) => {
        if (err) {
          return reject(err)
        }
        return resolve(result)
      })
    })
  }
}
