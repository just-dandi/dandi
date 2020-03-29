import { InjectionToken } from '@dandi/core'
import { MemberMetadata } from '@dandi/model'

import { localToken } from './local-token'
import { ModelError } from './model-error'

export interface ModelValidator {
  validateMember(metadata: MemberMetadata, key: string, value: any): ModelError[]
}

export const ModelValidator: InjectionToken<ModelValidator> = localToken.opinionated('ModelValidator', {
  multi: true,
})
