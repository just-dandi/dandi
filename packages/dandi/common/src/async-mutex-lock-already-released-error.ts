import { AppError } from './app-error'

/**
 * Thrown when attempting to access instance members of a locked resource when the lock has already been released.
 */
export class AsyncMutexLockAlreadyReleasedError extends AppError {
  constructor() {
    super('Cannot use this lock because it was already released')
  }
}
