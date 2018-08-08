import { Url } from '@dandi/common';
import { Injectable } from '@dandi/core';

import { TypeValidator } from './type.validator';

@Injectable(TypeValidator)
export class UrlTypeValidator implements TypeValidator<Url> {
  public readonly type = Url;
  public validate(value: string): Url {
    return new Url(value);
  }
}
