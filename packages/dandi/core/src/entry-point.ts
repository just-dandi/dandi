import { InjectionToken } from './injection-token'
import { localOpinionatedToken } from './local-token'

export interface EntryPoint<T = void> {
  run(): T | Promise<T>
}

export const EntryPoint: InjectionToken<EntryPoint> = localOpinionatedToken<EntryPoint>('EntryPoint', {
  multi: false,
})
