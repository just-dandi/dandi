import { Url }        from '@dandi/core';
import { Injectable } from '@dandi/di-core';

import { TypeValidator } from './type.validator';

@Injectable(TypeValidator(Url))
export class UrlTypeValidator implements TypeValidator<Url> {

    public validate(value: string): Url {
        return new Url(value);
    }

}
