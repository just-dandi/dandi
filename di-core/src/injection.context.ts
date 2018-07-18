import { Constructor } from '@dandi/core';

import { InjectionToken }        from './injection.token';
import { localOpinionatedToken } from './local.token';

export type InjectionContext = Constructor<any> | Function;

export const InjectionContext: InjectionToken<InjectionContext> =
    localOpinionatedToken<InjectionContext>('InjectionContext', { multi: false, singleton: false });
