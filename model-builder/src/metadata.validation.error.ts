import { AppError } from '@dandi/common';

export class MetadataValidationError extends AppError {
  constructor(public readonly metadataKey, message?: string) {
    super(`${metadataKey}${message ? ' ' : ''}${message || ''}`);
  }
}
