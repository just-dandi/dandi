import { AppError } from './app-error'

export class InvalidAccessError extends AppError {
  constructor(message: string) {
    super(message)
  }
}
