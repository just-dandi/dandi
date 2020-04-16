import { AppError } from '@dandi/common'
import { ViewEngineConfig, ViewEngineIndexedConfig } from '..'

export class MissingTemplateError extends AppError {
  constructor(paths: string[], name: string, configs: ViewEngineIndexedConfig[]) {
    let missingTemplateError = `\n\nCould not find template named '${name}' for any configured ViewEngine, tried these paths: \n\n`
    for(const config of configs) {
      for(const path of paths) {
        missingTemplateError += `  '${path}.${config.extension}'\n`
      }
    }
    super(missingTemplateError)
  }
}
