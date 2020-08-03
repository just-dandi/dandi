import { localToken } from './local-token'

export interface ExpressMvcConfig {
  host?: string
  port?: number
}

export const ExpressMvcConfig = localToken.opinionated<ExpressMvcConfig>('ExpressMvcConfig', {
  multi: false,
})

const DEFAULT_PORT = 80

export const DefaultExpressMvcConfig: ExpressMvcConfig = {
  host: '0.0.0.0',
  port: Number(process.env.PORT) || DEFAULT_PORT,
}
