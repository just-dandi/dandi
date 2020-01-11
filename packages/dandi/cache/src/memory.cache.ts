import { Injectable } from '@dandi/core'
import { Duration } from 'luxon'

import { Cache, CacheProvider, CacheProviderType } from './cache.provider'
import Timer = NodeJS.Timer

@Injectable(CacheProvider(CacheProviderType.localMemory))
export class MemoryCache implements Cache {
  private map = new Map<symbol, any>()
  private timeouts = new Map<symbol, Timer>()

  public get<T>(key: symbol): Promise<T> {
    return Promise.resolve(this.map.get(key))
  }

  public set(key: symbol, value: any, duration?: Duration): Promise<void> {
    this.clearTimeout(key)
    this.map.set(key, value)
    if (duration) {
      this.timeouts.set(
        key,
        setTimeout(() => {
          this.map.delete(key)
          this.timeouts.delete(key)
        }, duration.as('milliseconds')),
      )
    }
    return Promise.resolve()
  }

  public delete(key: symbol): Promise<boolean> {
    this.clearTimeout(key)
    return Promise.resolve(this.map.delete(key))
  }

  public clear(): Promise<number> {
    this.timeouts.forEach((timer) => clearTimeout(timer))
    const count = this.map.size
    this.map.clear()
    this.timeouts.clear()
    return Promise.resolve(count)
  }

  private clearTimeout(key: symbol): void {
    const existingTimeout = this.timeouts.get(key)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
      this.timeouts.delete(key)
    }
  }
}
