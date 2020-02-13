import { HttpStatusCode } from '@dandi/http'

export interface HttpPipelineErrorEntry {
  message: string
  innerMessage?: string
  stack?: string
}

export interface HttpPipelineErrorData {
  message: string
  statusCode: HttpStatusCode
  errors: HttpPipelineErrorEntry[]
}
