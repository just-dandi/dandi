import { InjectionToken } from '@dandi/core'
import { MemberMetadata } from '@dandi/model'

import { localOpinionatedToken } from './local-token'

/**
 * Defines an object that provides model validation services
 */
export interface ModelValidator {
  /**
   * Determines if a value is valid given the criteria defined in the validation metadata. Implementations must
   * throw an error if the value does not meet the validation criteria.
   * @param metadata The metadata object for the member
   * @param key The name of the property
   * @param value The value to validate
   */
  validateMember(metadata: MemberMetadata, key: string, value: any): void
}

export const ModelValidator: InjectionToken<ModelValidator> = localOpinionatedToken('ModelValidator', {
  multi: true,
})
