import { InjectionContext } from './injection-context'
import { LogLevel } from './log-level'
import { LogCallOptions } from './logger-method'

/**
 * An object containing data from a single call to a {@see Logger} method.
 */
export interface LogEntry {

  /**
   * The severity level of the entry
   */
  level: LogLevel

  /**
   * The {@see InjectionContext} of the object that called the {@see Logger} method
   */
  context?: InjectionContext

  /**
   * A timestamp representing when the {@see Logger} method was called
   */
  ts: number

  /**
   * The array of arguments that the {@see Logger} method was called with
   */
  args: any[]

  /**
   * A {@see LogCallOptions} object representing the chain used to call the {@see Logger} method
   */
  options?: LogCallOptions
}
