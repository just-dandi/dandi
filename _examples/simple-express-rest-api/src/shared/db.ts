import { Injectable, Singleton } from '@dandi/core'

const FAKE_LATENCY = 50

function delayedDo(fn: () => any): Promise<any> {
  return new Promise<any>((resolve) => {
    setTimeout(() => resolve(fn()), FAKE_LATENCY)
  })
}

@Injectable(Singleton)
export class Db {
  private storage: Map<string, any> = new Map<string, any>()

  constructor() {}

  public set(key: string, value: any): Promise<any> {
    return delayedDo(() => {
      this.storage.set(key, value)
      return value
    })
  }

  public get(key: string): Promise<any> {
    return delayedDo(() => this.storage.get(key))
  }
}
