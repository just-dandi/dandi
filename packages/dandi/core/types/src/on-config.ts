import { localToken } from '../../src/local-token'

export type OnConfig = (...args: any[]) => void

export const OnConfig = localToken.opinionated<OnConfig>('OnConfig', {
  multi: true,
})
