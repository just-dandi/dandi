import { AppError } from '@dandi/common'

/**
 * Thrown when an {@see InstanceGenerator} cannot determine how to resolve a value from a {@see Provider}.
 */
export class ProviderTypeError extends AppError {
  constructor(public readonly target: any) {
    super('Specified object is not a valid provider')
  }
}
