import { AppError } from '@dandi/common'

export class MetadataValidationError extends AppError {
  constructor(message: string) {
    super(message)
  }
}
