import { DateTime } from '@dandi/common';
import { Injectable } from '@dandi/core';
import { MemberMetadata } from '@dandi/model';

import { TypeValidationError, TypeValidator } from './type.validator';

@Injectable(TypeValidator)
export class DateTimeTypeValidator implements TypeValidator<DateTime> {
  public readonly type = DateTime;
  public validate(value: any, metadata: MemberMetadata): DateTime {
    let dt: DateTime;
    const asInt = parseInt(value, 10);
    const isNumber =
      typeof value === 'number' ||
      // most dates will successfully parse into something, so check to make sure it's the same as the string
      // e.g. parseInt('2018/06/08 12:53 PM') => 2018
      (!isNaN(asInt) && asInt.toString() === value.toString().trim());
    if (value instanceof Date) {
      dt = DateTime.fromJSDate(value);
    } else if (isNumber) {
      dt = DateTime.fromMillis(asInt);
    } else {
      if (metadata && metadata.format) {
        dt = DateTime.fromFormat(value, metadata.format, {
          zone: 'utc',
        });
      } else {
        dt = DateTime.fromISO(value);
      }
    }
    if (!dt.isValid) {
      throw new TypeValidationError(value, DateTime);
    }

    return dt;
  }
}
