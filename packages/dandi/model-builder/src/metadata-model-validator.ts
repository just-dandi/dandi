import { Injectable } from '@dandi/core'
import { MemberMetadata } from '@dandi/model'

import { ModelError } from './model-error'
import { ModelErrorKey } from './model-error-key'
import { ModelValidationError } from './model-validation-error'
import { ModelValidator } from './model-validator'
import { RequiredPropertyError } from './required-property-error'

@Injectable(ModelValidator)
export class MetadataModelValidator implements ModelValidator {

  public validateMember(metadata: MemberMetadata, key: string, value: any): ModelError[] {

    if (value === null || value === undefined || value === '') {
      if (metadata.required) {
        return [new RequiredPropertyError(key)]
      }
      return []
    }

    const errors: ModelError[] = []

    if (metadata.pattern && !metadata.pattern.test(value.toString())) {
      errors.push(new ModelValidationError(key, 'pattern', metadata.pattern))
    }
    if (value.length === undefined) {

      if (!isNaN(metadata.minLength)) {
        errors.push(new ModelValidationError(key, ModelErrorKey.minLength, metadata.minLength, 'value does not have a length property'))
      }
      if (!isNaN(metadata.maxLength)) {
        errors.push(new ModelValidationError(key, ModelErrorKey.maxLength, metadata.minLength, 'value does not have a length property'))
      }

    } else {

      if (!isNaN(metadata.minLength) && value.length < metadata.minLength) {
        errors.push(new ModelValidationError(
          key,
          ModelErrorKey.minLength,
          metadata.minLength,
          `value must have a length of at least ${metadata.minLength}`,

        ))
      }
      if (!isNaN(metadata.maxLength) && value.length > metadata.maxLength) {
        errors.push(new ModelValidationError(
          key,
          ModelErrorKey.maxLength,
          metadata.maxLength,
          `value must have a length of at most ${metadata.maxLength}`,
        ))
      }

    }

    if (isNaN(value)) {

      if (!isNaN(metadata.minValue)) {
        errors.push(new ModelValidationError(
          key,
          ModelErrorKey.minValue,
          metadata.minValue,
          'value is not numeric',
        ))
      }
      if (!isNaN(metadata.maxValue)) {
        errors.push(new ModelValidationError(
          key,
          ModelErrorKey.maxValue,
          metadata.maxValue,
          'value is not numeric',
        ))
      }

    } else {

      if (!isNaN(metadata.minValue) && (value as any) < metadata.minValue) {
        errors.push(new ModelValidationError(
          key,
          ModelErrorKey.minValue,
          metadata.minValue,
          `value must be at least ${metadata.minValue}`,
        ))
      }
      if (!isNaN(metadata.maxValue) && (value as any) > metadata.maxValue) {
        errors.push(new ModelValidationError(
          key,
          ModelErrorKey.maxValue,
          metadata.maxValue,
          `value must be at most ${metadata.maxValue}`,
        ))
      }

    }

    return errors
  }
}
