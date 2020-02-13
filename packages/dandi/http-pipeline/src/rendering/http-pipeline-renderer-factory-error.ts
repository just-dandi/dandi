import { ServerError } from '@dandi/http'

export class HttpPipelineRendererFactoryError extends ServerError {
  constructor(internalMessage: string, public readonly errors?: Error[]) {
    super(internalMessage)
  }
}
