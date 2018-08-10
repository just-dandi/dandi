import { Constructor, DateTime, Url } from '@dandi/common';

import { getMemberMetadata, MemberMetadata } from './member.metadata';
import { EMAIL_PATTERN, URL_PATTERN } from './pattern';

const EMAIL_MIN_LENGTH = 6;
const EMAIL_MAX_LENGTH = 254;

export function modelDecorator(
  decoratorMetadata: MemberMetadata,
  target: any,
  propertyName: string,
  paramIndex?: number,
) {
  const memberMetadata = getMemberMetadata(target.constructor, propertyName, paramIndex);
  Object.assign(memberMetadata, decoratorMetadata);
}

export function Property(type?: Constructor<any>) {
  return modelDecorator.bind(null, { type });
}
export function Required() {
  return modelDecorator.bind(null, { required: true });
}
export function MinLength(minLength: number) {
  return modelDecorator.bind(null, { minLength });
}
export function MaxLength(maxLength: number) {
  return modelDecorator.bind(null, { maxLength });
}
export function MinValue(minValue: number) {
  return modelDecorator.bind(null, { minValue });
}
export function MaxValue(maxValue: number) {
  return modelDecorator.bind(null, { maxValue });
}
export function Pattern(pattern: RegExp) {
  return modelDecorator.bind(null, { pattern });
}
export function Email() {
  return modelDecorator.bind(null, {
    minLength: EMAIL_MIN_LENGTH,
    maxLength: EMAIL_MAX_LENGTH,
    pattern: EMAIL_PATTERN,
    type: String,
  });
}
export function UrlProperty() {
  return modelDecorator.bind(null, {
    pattern: URL_PATTERN,
    type: Url,
  });
}
export function DateTimeFormat(format: string) {
  return modelDecorator.bind(null, {
    format,
    type: DateTime,
  });
}

export function ArrayOf<T>(itemType: Constructor<T>, pattern?: RegExp) {
  return modelDecorator.bind(null, {
    type: Array,
    subType: itemType,
  });
}

export function UrlArray() {
  return modelDecorator.bind(null, {
    type: Array,
    subType: Url,
    pattern: URL_PATTERN,
  });
}

// TODO: move this into @dandi/common or @dandi/core - this could be used for injection too
export function OneOf(...oneOf: Array<Constructor<any>>) {
  return modelDecorator.bind(null, {
    type: OneOf,
    oneOf,
  });
}
