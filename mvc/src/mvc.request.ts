import { InjectionToken } from '@dandi/core';

import { HttpMethod }            from './http.method';
import { localOpinionatedToken } from './local.token';

export interface MvcRequest {

    body: any;
    get(key: string): string;
    params: any;
    path: string;
    query: any;
    method: HttpMethod;

}

export const MvcRequest: InjectionToken<MvcRequest> = localOpinionatedToken<MvcRequest>('MvcRequest', {
    multi:     false,
    singleton: false,
});
