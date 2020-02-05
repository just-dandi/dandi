import { AppError } from '@dandi/common'

export class RouteGeneratorError extends AppError {
  constructor(message: string, innerError?: Error) {
    super(message, innerError)
  }
}
