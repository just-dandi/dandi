import { ServerError } from '@dandi/http'

export class ViewResultFactoryError extends ServerError {
  constructor(message?: string) {
    super(message)
  }
}
