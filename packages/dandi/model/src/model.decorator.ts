import { Constructor, Url } from '@dandi/common'
import { DateTime } from 'luxon'

import { MemberMetadata, MemberSourceAccessor, getMemberMetadata } from './member.metadata'
import { MetadataValidationError } from './metadata-validation-error'
import { EMAIL_PATTERN, URL_PATTERN } from './pattern'

const EMAIL_MIN_LENGTH = 6
const EMAIL_MAX_LENGTH = 254

export function modelDecorator(
  decoratorMetadata: MemberMetadata,
  target: any,
  propertyName: string,
  paramIndex?: number,
): void {
  const memberMetadata = getMemberMetadata(target.constructor, propertyName, paramIndex)
  Object.assign(memberMetadata, decoratorMetadata)

  // TODO:
  //   Separate validation decorators vs type decorators (e.g. required is validation, map/arrayOf/set/etc are type)
  //   Add code to check against conflicting validation decorators (e.g. minLength greater than maxLength, etc)
}

export function Property(type?: Constructor<any>): PropertyDecorator {
  return modelDecorator.bind(null, { type })
}
export function Required(): PropertyDecorator {
  return modelDecorator.bind(null, { required: true })
}
export function MinLength(minLength: number): PropertyDecorator {
  if (isNaN(minLength)) {
    throw new MetadataValidationError('minLength must be a number')
  }
  return modelDecorator.bind(null, { minLength })
}
export function MaxLength(maxLength: number): PropertyDecorator {
  if (isNaN(maxLength)) {
    throw new MetadataValidationError('maxLength must be a number')
  }
  return modelDecorator.bind(null, { maxLength })
}
export function MinValue(minValue: number): PropertyDecorator {
  if (isNaN(minValue)) {
    throw new MetadataValidationError('minValue must be a number')
  }
  return modelDecorator.bind(null, { minValue })
}
export function MaxValue(maxValue: number): PropertyDecorator {
  if (isNaN(maxValue)) {
    throw new MetadataValidationError('maxValue must be a number')
  }
  return modelDecorator.bind(null, { maxValue })
}
export function Pattern(pattern: RegExp): PropertyDecorator {
  if (!(pattern instanceof RegExp)) {
    throw new MetadataValidationError('pattern must be a RegExp instance')
  }
  return modelDecorator.bind(null, { pattern })
}
export function Email(): PropertyDecorator {
  return modelDecorator.bind(null, {
    minLength: EMAIL_MIN_LENGTH,
    maxLength: EMAIL_MAX_LENGTH,
    pattern: EMAIL_PATTERN,
    type: String,
  })
}
export function UrlProperty(): PropertyDecorator {
  return modelDecorator.bind(null, {
    pattern: URL_PATTERN,
    type: Url,
  })
}
export function DateTimeFormat(format: string): PropertyDecorator {
  return modelDecorator.bind(null, {
    format,
    type: DateTime,
  })
}

export function ArrayOf<T>(valueType: Constructor<T>): PropertyDecorator {
  return modelDecorator.bind(null, {
    type: Array,
    valueType,
  })
}

export function SetOf<T>(valueType: Constructor<T>): PropertyDecorator {
  return modelDecorator.bind(null, {
    type: Set,
    valueType,
  })
}

export function MapOf<TKey, TValue>(keyType: Constructor<TKey>, valueType: Constructor<TValue>): PropertyDecorator {
  return modelDecorator.bind(null, {
    type: Map,
    keyType,
    valueType,
  })
}

export function UrlArray(): PropertyDecorator {
  return modelDecorator.bind(null, {
    type: Array,
    valueType: Url,
    pattern: URL_PATTERN,
  })
}

// TODO: move this into @dandi/common - this could be used for injection too
export function OneOf(...oneOf: Array<Constructor<any>>): any {
  return modelDecorator.bind(null, {
    type: OneOf,
    oneOf,
  })
}

export function SourceAccessor(sourceAccessor: MemberSourceAccessor): PropertyDecorator {
  return modelDecorator.bind(null, {
    sourceAccessor,
  })
}
