import { Constructor }    from '@dandi/common';
import { InjectionToken } from '@dandi/core';

export interface ConfigToken<T> {
    type: Constructor<T>;
    provide?: InjectionToken<T>;
    key: string;
    encrypted: boolean;
}
