import { localToken } from './local-token'

export interface BeforeInvokeHandler {
  onBeforeInvoke(...args: any[]): void | Promise<void>
}

export const BeforeInvokeHandler = localToken.opinionated<BeforeInvokeHandler>('BeforeInvokeHandler', {
  multi: true,
})
