import { AppError } from '@dandi/common';

export class ModelValidationError extends AppError {
  constructor(public readonly propertyName: string, innerError: Error) {
    super(
      `Error validating ${propertyName}: ${innerError.message}`,
      innerError,
    );
  }
}
