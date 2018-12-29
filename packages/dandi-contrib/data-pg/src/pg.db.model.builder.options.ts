import { InjectionToken } from '@dandi/core'
import { ModelBuilderOptions } from '@dandi/model-builder'

import { localOpinionatedToken } from './local.token'

export const PgDbModelBuilderOptions: InjectionToken<ModelBuilderOptions> = localOpinionatedToken(
  'PgDbModelBuilderOptions',
  {
    multi: false,
  },
)
