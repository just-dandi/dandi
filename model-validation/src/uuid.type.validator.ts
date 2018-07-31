import { Uuid } from '@dandi/common';
import { Injectable } from '@dandi/core';
import { UUID_PATTERN } from '@dandi/model';

import { TypeValidationError, TypeValidator } from './type.validator';

@Injectable(TypeValidator(Uuid))
export class UuidTypeValidator implements TypeValidator<Uuid> {
  public validate(obj: string): Uuid {
    if (!UUID_PATTERN.test(obj)) {
      throw new TypeValidationError(obj, Uuid);
    }
    return Uuid.for(obj);
  }
}
