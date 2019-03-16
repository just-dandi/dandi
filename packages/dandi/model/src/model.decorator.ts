import { Constructor, Url } from '@dandi/common'
import { DateTime } from 'luxon'

import { EMAIL_PATTERN, URL_PATTERN } from './pattern'
import { MemberMetadata, MemberSourceAccessor, getMemberMetadata } from './member.metadata'

const EMAIL_MIN_LENGTH = 6
const EMAIL_MAX_LENGTH = 254

/**
 * @ignore
 * @internal
 */
export function modelDecorator(
  decoratorMetadata: MemberMetadata,
  target: any,
  propertyName: string,
  paramIndex?: number,
): void {
  const memberMetadata = getMemberMetadata(target.constructor, propertyName, paramIndex)
  Object.assign(memberMetadata, decoratorMetadata)
}

/**
 * @decorator
 * Marks a member as a model property
 * @param type The type of the property
 */
export function Property(type?: Constructor<any>): PropertyDecorator {
  return modelDecorator.bind(null, { type })
}

/**
 * @decorator
 * Marks a member as required
 */
export function Required(): PropertyDecorator {
  return modelDecorator.bind(null, { required: true })
}

/**
 * @decorator
 * Marks a property to define a minimum required length for the property's value.
 *
 * Can be used on `string` and `Array` values, or any type that has a `length` property.
 * @param minLength
 */
export function MinLength(minLength: number): PropertyDecorator {
  return modelDecorator.bind(null, { minLength })
}

/**
 * @decorator
 * Marks a property to define a maximum required length for the property's value.
 *
 * Can be used on `string` and `Array` values, or any type that has a `length` property.
 * @param maxLength
 */
export function MaxLength(maxLength: number): PropertyDecorator {
  return modelDecorator.bind(null, { maxLength })
}

/**
 * @decorator
 * Marks a property to define a minimum required value for the property's value.
 * @param minValue
 */
export function MinValue(minValue: number): PropertyDecorator {
  return modelDecorator.bind(null, { minValue })
}

/**
 * @decorator
 * Marks a property to define a maximum required value for the property's value.
 * @param maxValue
 */
export function MaxValue(maxValue: number): PropertyDecorator {
  return modelDecorator.bind(null, { maxValue })
}

/**
 * @decorator
 * Marks a property to define a `RegExp` pattern that the property's value must match.
 * @param pattern
 */
export function Pattern(pattern: RegExp): PropertyDecorator {
  return modelDecorator.bind(null, { pattern })
}

/**
 * @decorator
 * Marks a property such that the value must be a valid e-mail address.
 */
export function Email(): PropertyDecorator {
  return modelDecorator.bind(null, {
    minLength: EMAIL_MIN_LENGTH,
    maxLength: EMAIL_MAX_LENGTH,
    pattern: EMAIL_PATTERN,
    type: String,
  })
}

/**
 * @decorator
 * Marks a property such that the value must be a valid URL.
 */
export function UrlProperty(): PropertyDecorator {
  return modelDecorator.bind(null, {
    pattern: URL_PATTERN,
    type: Url,
  })
}

/**
 * @decorator
 * Marks a property to define a format for parsing and formatting a `DateTime` value.
 * @param format
 */
export function DateTimeFormat(format: string): PropertyDecorator {
  return modelDecorator.bind(null, {
    format,
    type: DateTime,
  })
}

/**
 * @decorator
 * Marks a member as an `Array` property.
 * @param valueType
 */
export function ArrayOf<T>(valueType: Constructor<T>): PropertyDecorator {
  return modelDecorator.bind(null, {
    type: Array,
    valueType,
  })
}

/**
 * @decorator
 * Marks a member as a `Set` property.
 * @param valueType
 */
export function SetOf<T>(valueType: Constructor<T>): PropertyDecorator {
  return modelDecorator.bind(null, {
    type: Set,
    valueType,
  })
}

/**
 * @decorator
 * Marks a member as a `Map` property.
 * @param keyType
 * @param valueType
 */
export function MapOf<TKey, TValue>(keyType: Constructor<TKey>, valueType: Constructor<TValue>): PropertyDecorator {
  return modelDecorator.bind(null, {
    type: Map,
    keyType,
    valueType,
  })
}

/**
 * @decorator
 * Marks a member as a [[Url]] property.
 */
export function UrlArray(): PropertyDecorator {
  return modelDecorator.bind(null, {
    type: Array,
    valueType: Url,
    pattern: URL_PATTERN,
  })
}

// TODO: move this into @dandi/common - this could be used for injection too
/**
 * @decorator
 * Marks a member as a property that can be one of multiple types.
 *
 * When using [[@OneOf()]], the validator will use the first type that successfully validates.
 * @param oneOf
 */
export function OneOf(...oneOf: Array<Constructor<any>>): any {
  return modelDecorator.bind(null, {
    type: OneOf,
    oneOf,
  })
}

/**
 * @decorator
 * Marks a member to define an alternate source of the value when constructing the model.
 * @param sourceAccessor
 */
export function SourceAccessor(sourceAccessor: MemberSourceAccessor): PropertyDecorator {
  return modelDecorator.bind(null, {
    sourceAccessor,
  })
}
