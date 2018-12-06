import { AppError } from '@dandi/common';

export class ViewResultFactoryError extends AppError {
  constructor(message?: string) {
    super(message);
  }
}
