import { Constructor }    from '@dandi/core';
import { InjectionToken } from '@dandi/di-core';

export interface ConfigToken<T> {
    type: Constructor<T>;
    provide?: InjectionToken<T>;
    key: string;
    encrypted: boolean;
}
