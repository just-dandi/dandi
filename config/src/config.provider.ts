import { Constructor } from '@dandi/core';
import { Provider }    from '@dandi/di-core';

import { ConfigClient }   from './config.client';
import { ConfigResolver } from './config.resolver';
import { ConfigToken }    from './config.token';

export function configValueFactory<T>(token: ConfigToken<T>, client: ConfigClient, resolver: ConfigResolver): Promise<T> {
    return resolver.resolve(client, token);
}

export function configProvider<T>(client: Constructor<ConfigClient>, token: ConfigToken<T>): Provider<T> {
    return {
        provide:    token.provide || token.type,
        useFactory: configValueFactory.bind(null, token),
        async:      true,
        deps:       [ client, ConfigResolver ]
    };
}
