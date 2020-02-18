import { InjectionToken } from '@dandi/core'
import { MemberMetadata } from '@dandi/model'

import { localToken } from './local-token'

export interface ModelValidator {
  validateMember(metadata: MemberMetadata, key: string, value: any): void
}

export const ModelValidator: InjectionToken<ModelValidator> = localToken.opinionated('ModelValidator', {
  multi: true,
})
