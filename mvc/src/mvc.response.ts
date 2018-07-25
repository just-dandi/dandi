import { InjectionToken } from '@dandi/core';

import { localOpinionatedToken } from './local.token';

export interface MvcResponse {

    cookie(name: string, value: string): this;
    contentType(contentType: string): this;
    end(): void;
    header(field: string, value?: string): this;
    json(body: any): this;
    redirect(url: string): void;
    send(body?: any): this;
    set(field: string, value?: string): this;
    setHeader(field: string, value?: string): this;
    status(code: number): this;

}

export const MvcResponse: InjectionToken<MvcResponse> = localOpinionatedToken<MvcResponse>('MvcResponse', {
    multi:     false,
    singleton: false,
});
