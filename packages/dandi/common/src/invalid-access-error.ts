import { AppError } from './app-error'

/**
 * Thrown when attempting to access a member that may not be accessed.
 */
export class InvalidAccessError extends AppError {

  constructor(message: string) {
    super(message)
  }

}
