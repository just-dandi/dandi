import { Constructor }    from '@dandi/core';
import { InjectionToken } from '@dandi/di-core';

import { localOpinionatedToken } from './local.token';

export interface HttpEventOptions {
    validateBody?: Constructor<any>;
    successStatusCode?: number;
    errorStatusCode?: number;
}

export const HttpEventOptions: InjectionToken<HttpEventOptions> =
    localOpinionatedToken('HttpEventOptions', { multi: false });
