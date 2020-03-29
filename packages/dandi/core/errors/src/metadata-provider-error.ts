import { AppError } from '@dandi/common'

export class MetadataProviderError extends AppError {
  constructor(message: string, innerError?: Error) {
    super(message, innerError)
  }
}
