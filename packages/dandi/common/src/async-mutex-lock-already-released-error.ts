import { AppError } from './app-error'

export class AsyncMutexLockAlreadyReleasedError extends AppError {
  constructor() {
    super('Cannot use this lock because it was already released')
  }
}
