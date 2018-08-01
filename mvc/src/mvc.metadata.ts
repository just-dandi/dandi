import { CorsConfig } from './cors.config';

export interface MvcMetadata {
  path?: string;
  cors?: CorsConfig | true;
}
