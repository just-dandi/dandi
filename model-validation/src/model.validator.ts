import { Constructor }    from '@dandi/core';
import { InjectionToken } from '@dandi/di-core';
import { MemberMetadata } from '@dandi/model';

import { localOpinionatedToken } from './local.token';

export interface ModelValidator {
    validateModel<T>(type: Constructor<T>, obj: any): T;
    validateMember(metadata: MemberMetadata, key: string, value: any): any;
}

export const ModelValidator: InjectionToken<ModelValidator> =
    localOpinionatedToken<ModelValidator>('ModelValidator', { multi: false });
