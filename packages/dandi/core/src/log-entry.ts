import { InjectionContext } from './injection-context'
import { LogLevel } from './log-level'
import { LogCallOptions } from './logger-method'

/**
 * An object containing data from a single call to a [[Logger]] method.
 */
export interface LogEntry {

  /**
   * The severity level of the entry
   */
  level: LogLevel

  /**
   * The [[InjectionContext]] of the object that called the [[Logger]] method
   */
  context?: InjectionContext

  /**
   * A timestamp representing when the [[Logger]] method was called
   */
  ts: number

  /**
   * The array of arguments that the [[Logger]] method was called with
   */
  args: any[]

  /**
   * A [[LogCallOptions]] object representing the chain used to call the [[Logger]] method
   */
  options?: LogCallOptions
}
