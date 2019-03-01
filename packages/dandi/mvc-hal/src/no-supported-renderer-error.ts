import { AppError } from '@dandi/common'

export class NoSupportedRendererError extends AppError {
  constructor(contentType: string) {
    super(`No supported renderer is configured for rendering contentType '${contentType}'`)
  }
}
