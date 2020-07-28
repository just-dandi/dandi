import { localToken } from './local-token'

export interface ExpressMvcConfig {
  port: number
}

export const ExpressMvcConfig = localToken.opinionated<ExpressMvcConfig>('@dandi/mvc:ExpressMvcConfig', {
  multi: false,
})
