import { AppError } from '@dandi/common'

export class ColorsNotLoadedError extends AppError {
  constructor() {
    super('The "colors" package must be installed to use the "PrettyColorsLogging" configuration. Please install "colors" using your package manager.')
  }
}
