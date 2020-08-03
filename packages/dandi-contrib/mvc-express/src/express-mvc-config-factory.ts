import { Provider } from '@dandi/core'

import { ExpressMvcConfig, DefaultExpressMvcConfig } from './express-mvc-config'

export function expressMvcConfigFactory(config?: Partial<ExpressMvcConfig>): () => ExpressMvcConfig {
  return () => Object.assign({}, DefaultExpressMvcConfig, config)
}

export const DefaultExpressMvcConfigProvider: Provider<ExpressMvcConfig> = {
  provide: ExpressMvcConfig,
  useFactory: expressMvcConfigFactory(),
}
