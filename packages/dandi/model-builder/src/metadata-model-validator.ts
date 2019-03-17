import { Injectable } from '@dandi/core'
import { MemberMetadata } from '@dandi/model'

import { MetadataValidationError } from './metadata-validation-error'
import { ModelValidator } from './model-validator'
import { RequiredPropertyError } from './required-property-error'

/**
 * The default implementation of [[ModelValidator]].
 */
@Injectable(ModelValidator)
export class MetadataModelValidator implements ModelValidator {
  public validateMember(metadata: MemberMetadata, key: string, value: any): void {
    if (value === null || value === undefined) {
      if (metadata.required) {
        throw new RequiredPropertyError(key)
      }
      return
    }

    if (metadata.pattern && !metadata.pattern.test(value.toString())) {
      throw new MetadataValidationError('pattern')
    }
    if ((!isNaN(metadata.minLength) || !isNaN(metadata.maxLength)) && value.length === undefined) {
      throw new MetadataValidationError('minLength or maxLength', 'value does not have a length property')
    }
    if (!isNaN(metadata.minLength) && value.length < metadata.minLength) {
      throw new MetadataValidationError('minLength')
    }
    if (!isNaN(metadata.maxLength) && value.length > metadata.maxLength) {
      throw new MetadataValidationError('maxLength')
    }
    if ((!isNaN(metadata.minValue) || !isNaN(metadata.maxValue)) && isNaN(value as any)) {
      throw new MetadataValidationError('minValue or maxValue', 'value is not numeric')
    }
    if (!isNaN(metadata.minValue) && (value as any) < metadata.minValue) {
      throw new MetadataValidationError('minValue')
    }
    if (!isNaN(metadata.maxValue) && (value as any) > metadata.maxValue) {
      throw new MetadataValidationError('maxValue')
    }

    return value
  }
}
