import { Constructor } from './constructor'
import { CUSTOM_INSPECTOR } from './custom-inspector'

export const BASE_SPACER = '    '

export class AppError extends Error {
  public static stack(err: Error, level: number = 1): string {
    return err instanceof AppError ? err.getStack(level) : AppError.indent(err.stack, level)
  }

  public static getInnerError<TError extends Error>(errorType: Constructor<TError>, error: Error): TError {
    if (error instanceof errorType) {
      return error
    }
    if (error instanceof AppError) {
      return AppError.getInnerError(errorType, error.innerError)
    }

    return undefined
  }

  public static indent(source: string, level: number): string {
    if (!source) {
      return source
    }
    const spacer = AppError.getIndent(level)
    const [, linebreak] = source.match(/(\r?\n)/) || [undefined, '']
    const lines = source.split(/\r?\n/)
    return lines.join(`${linebreak}${spacer}`)
  }

  public static indentLine(source: string, level: number): string {
    return `${AppError.getIndent(level)}${source}`
  }

  private static getIndent(level: number): string {
    return Array(level + 1).join(BASE_SPACER)
  }

  constructor(message?: string, public readonly innerError?: Error) {
    super(AppError.indent(message, 0))
  }

  public getStack(level: number = 1): string {
    const spacer = AppError.getIndent(level)
    let stack = AppError.indent(this.stack.replace(/^Error:/, `${this.constructor.name}:`), level)
    if (this.innerError) {
      const innerStack = AppError.stack(this.innerError, level)
      stack += `\n\n${spacer}Inner ${innerStack}`
    }
    return stack
  }

  public [CUSTOM_INSPECTOR](): string {
    return AppError.stack(this)
  }
}
