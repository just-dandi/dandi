import { Duration }              from '@dandi/common';
import { Injectable, Singleton } from '@dandi/core';

import { Cache, CacheProvider, CacheProviderType } from './cache.provider';
import Timer = NodeJS.Timer;

@Injectable(CacheProvider(CacheProviderType.localMemory), Singleton)
export class MemoryCache implements Cache {

    private map = new Map<Symbol, any>();
    private timeouts = new Map<Symbol, Timer>();

    constructor() {
    }

    private clearTimeout(key: Symbol): void {
        const existingTimeout = this.timeouts.get(key);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
            this.timeouts.delete(key);
        }
    }

    public get<T>(key: Symbol): Promise<T> {
        return Promise.resolve(this.map.get(key));
    }

    public set(key: Symbol, value: any, duration?: Duration): Promise<void> {
        this.clearTimeout(key);
        this.map.set(key, value);
        if (duration) {
            this.timeouts.set(key, setTimeout(() => {
                this.map.delete(key);
                this.timeouts.delete(key);
            }, duration.as('milliseconds')));
        }
        return Promise.resolve();
    }

    public delete(key: Symbol): Promise<boolean> {
        this.clearTimeout(key);
        return Promise.resolve(this.map.delete(key));
    }

    public clear(): Promise<number> {
        this.timeouts.forEach(timer => clearTimeout(timer));
        const count = this.map.size;
        this.map.clear();
        this.timeouts.clear();
        return Promise.resolve(count);
    }

}
