import { AppError } from '@dandi/common';

export class DandiAwsLambdaError extends AppError {
  constructor(message?: string, innerError?: Error) {
    super(message, innerError);
  }
}
