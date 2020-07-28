import { MemberMetadata } from '@dandi/model'

import { localToken } from './local-token'

export interface ModelValidator {
  validateMember(metadata: MemberMetadata, key: string, value: any): void
}

export const ModelValidator = localToken.opinionated<ModelValidator>('ModelValidator', {
  multi: true,
})
