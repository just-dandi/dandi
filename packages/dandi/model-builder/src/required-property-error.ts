import { AppError } from '@dandi/common'

export class RequiredPropertyError extends AppError {
  constructor(public readonly propertyName: string | number) {
    super(`The '${propertyName}' property is required`)
  }
}
