import { localToken } from '../../src/local-token'

export interface EntryPoint<T = void> {
  run(): T | Promise<T>
}

export const EntryPoint = localToken.opinionated<EntryPoint>('EntryPoint', {
  multi: false,
})
