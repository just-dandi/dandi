import { AppError, Constructor } from '@dandi/common';
import { Inject, Injectable } from '@dandi/core';
import { MemberMetadata } from '@dandi/model';

import { TypeValidationError, TypeValidator } from './type.validator';

@Injectable(TypeValidator)
export class StringTypeValidator implements TypeValidator<String> {
  public readonly type = String;
  public validate(obj: string): string {
    return obj;
  }
}

@Injectable(TypeValidator)
export class NumberTypeValidator implements TypeValidator<Number> {
  public readonly type = Number;
  public validate(obj: string): number {
    const result = parseInt(obj, 10);
    if (isNaN(result)) {
      throw new TypeValidationError(obj, Number);
    }
    return result;
  }
}

@Injectable(TypeValidator)
export class BooleanTypeValidator implements TypeValidator<Boolean> {
  public readonly type = Boolean;
  public validate(obj: any): boolean {
    if (obj === true || obj === false) {
      return obj;
    }
    if (obj === 0) {
      return false;
    }
    if (obj === 1) {
      return true;
    }
    if (typeof obj === 'string') {
      if (obj.toLocaleLowerCase() === 'true') {
        return true;
      }
      if (obj.toLocaleLowerCase() === 'false') {
        return false;
      }
    }
    throw new TypeValidationError(obj, Boolean);
  }
}

@Injectable()
export class PrimitiveTypeValidator {
  private primitive = new Map<Constructor<any>, TypeValidator<any>>();

  constructor(@Inject(TypeValidator) validators: TypeValidator<any>[]) {
    if (validators) {
      validators.forEach((validator) => this.primitive.set(validator.type, validator));
    }
  }

  public validate(value: any, metadata?: MemberMetadata): any {
    const primitiveValidator = this.primitive.get(metadata.type);
    if (!primitiveValidator) {
      throw new AppError(`${metadata.type} cannot be validated by PrimitiveTypeValidator`);
    }
    return primitiveValidator.validate(value, metadata);
  }
}
