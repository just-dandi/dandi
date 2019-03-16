import { InjectionToken } from './injection-token'
import { localOpinionatedToken } from './local-token'

/**
 * A service that is run on application startup after the rest of DI system is configured and initialized
 */
export interface EntryPoint<T = void> {

  /**
   * Executes application-specific startup behavior and optionally returns a value, or a Promise that results to a value.
   *
   * The return value is returned by [[DandiApplication.run]]
   */
  run(): T | Promise<T>
}

export const EntryPoint: InjectionToken<EntryPoint> = localOpinionatedToken<EntryPoint>('EntryPoint', {
  multi: false,
})
