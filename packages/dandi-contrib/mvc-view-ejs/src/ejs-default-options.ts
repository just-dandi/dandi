import { EjsOptions } from './ejs-options'

export const EJS_DEFAULT_OPTIONS: EjsOptions = Object.freeze({
  cache: process.env.NODE_ENV && process.env.NODE_ENV !== 'development',
  async: true,
  rmWhitespace: true,
})
