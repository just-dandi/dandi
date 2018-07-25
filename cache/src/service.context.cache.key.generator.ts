import { Inject, Injectable, InjectionContext, InjectionToken } from '@dandi/core';

import { CacheKeyGenerator } from './cache.key.generator';

const keys = new Map<string, Symbol>();

@Injectable(CacheKeyGenerator)
export class ServiceContextCacheKeyGenerator implements CacheKeyGenerator {

    constructor(
        @Inject(InjectionContext) private context: InjectionToken<any>,
    ) {}

    public keyFor(...args: any[]): Symbol {
        const contextTag = `[${typeof this.context === 'function' ? this.context.name : this.context}]`;
        args.unshift(contextTag);
        const keyStr = args.map(arg => arg.toString()).join(':');
        let key = keys.get(keyStr);
        if (!key) {
            key = Symbol(keyStr);
            keys.set(keyStr, key);
        }
        return key;
    }

}
