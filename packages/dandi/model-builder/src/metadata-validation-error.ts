import { AppError } from '@dandi/common'

/**
 * Thrown when a constructed model fails validation from [[MetadataModelValidator]].
 */
export class MetadataValidationError extends AppError {
  constructor(public readonly metadataKey, message?: string) {
    super(`${metadataKey}${message ? ' ' : ''}${message || ''}`)
  }
}