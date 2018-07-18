import { InjectionToken }        from './injection.token';
import { localOpinionatedToken } from './local.token';

export interface Bootstrapper {
    start(): void;
}

export const Bootstrapper: InjectionToken<Bootstrapper> =
    localOpinionatedToken<Bootstrapper>('Bootstrapper', { multi: false });
