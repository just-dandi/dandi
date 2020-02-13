import { resolve } from 'path'

import { ViewEngineErrorConfig } from '@dandi/mvc-view'

export const EJS_DEFAULT_ERROR_CONFIG: ViewEngineErrorConfig = {
  templates: {
    default: resolve(__dirname, 'errors/default.ejs'),
  },
}
