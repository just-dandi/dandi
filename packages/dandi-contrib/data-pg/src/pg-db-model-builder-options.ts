import { ModelBuilderOptions } from '@dandi/model-builder'

import { localToken } from './local-token'

export const PgDbModelBuilderOptions = localToken.opinionated<ModelBuilderOptions>('PgDbModelBuilderOptions', {
  multi: false,
})
