import { PugOptions } from './pug-options'

export const PUG_DEFAULT_OPTIONS: PugOptions = Object.freeze({
  cache: process.env.NODE_ENV && process.env.NODE_ENV !== 'development',
})
