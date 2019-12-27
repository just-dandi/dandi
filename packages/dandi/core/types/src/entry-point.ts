import { localToken } from '../../src/local-token'

import { InjectionToken } from './injection-token'

export interface EntryPoint<T = void> {
  run(): T | Promise<T>
}

export const EntryPoint: InjectionToken<EntryPoint> = localToken.opinionated<EntryPoint>('EntryPoint', {
  multi: false,
})
