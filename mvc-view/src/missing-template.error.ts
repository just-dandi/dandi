import { AppError } from '@dandi/common'

export class MissingTemplateError extends AppError {
  constructor(path: string, name: string) {
    super(`Could not find template named '${name}' for any configured ViewEngine in '${path}'`)
  }
}
