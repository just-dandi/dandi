/**
 * A generic error that can be used directly or extended to be more specific. Includes an optional `innerError` property
 * to allow retaining the original error (and its stack) when rethrowing more specific errors.
 */
export class AppError extends Error {

  /**
   * Builds an error stack from the specified `Error` instance, including the composite stack built from
   * [[AppError.getStack]].
   * @param err
   */
  public static stack(err: Error): string {
    return err instanceof AppError ? err.getStack() : err.stack
  }

  /**
   *
   * @param message The error message
   * @param innerError The original error the caused the error being constructed
   */
  constructor(message?: string, public readonly innerError?: Error) {
    super(message)
  }

  /**
   * Builds a composite stack from the instance's `stack` property and any nested `innerError` instances.
   */
  public getStack(): string {
    let stack = `${this.constructor.name} ${this.stack}`
    if (this.innerError) {
      const innerStack = this.innerError instanceof AppError ? this.innerError.getStack() : this.innerError.stack
      stack += '\n Inner ' + innerStack
    }
    return stack
  }
}
