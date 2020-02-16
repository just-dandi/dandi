import { CorsConfig } from '@dandi/http-pipeline'

export interface MvcMetadata {
  path?: string
  cors?: CorsConfig | true
}
