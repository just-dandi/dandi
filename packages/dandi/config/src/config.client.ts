import { ConfigToken } from './config.token'

export interface ConfigClient {
  readonly async: boolean
  readonly allowsEncryption: boolean
  get(token: ConfigToken<any>): any
}

export interface SyncConfigClient extends ConfigClient {
  readonly async: false
  get(token: ConfigToken<any>): string
}

export interface AsyncConfigClient extends ConfigClient {
  readonly async: true
  get(token: ConfigToken<any>): Promise<string>
}

export function isAsyncConfigClient(obj: ConfigClient): obj is AsyncConfigClient {
  return obj.async
}
