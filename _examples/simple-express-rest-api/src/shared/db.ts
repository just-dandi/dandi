import { Injectable } from '@dandi/core'

// don't add latency when doing profiling
// eslint-disable-next-line no-magic-numbers
const FAKE_LATENCY = process.execArgv.includes('--prof') ? 0 : 50

function delayedDo(fn: () => any): Promise<any> {
  return new Promise<any>((resolve) => {
    setTimeout(() => resolve(fn()), FAKE_LATENCY)
  })
}

@Injectable()
export class Db {
  private storage: Map<string, any> = new Map<string, any>()

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
